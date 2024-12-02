<?php

namespace Capco\AppBundle\Sluggable;

use Capco\AppBundle\Entity\Proposal;
use Doctrine\Common\EventArgs;
use Doctrine\Persistence\ObjectManager;
use Gedmo\Sluggable\Handler\SlugHandlerWithUniqueCallbackInterface;
use Gedmo\Sluggable\Mapping\Event\SluggableAdapter;
use Gedmo\Sluggable\SluggableListener as Base;
use Gedmo\Tool\Wrapper\AbstractWrapper;

/**
 * The SluggableListener handles the generation of slugs
 * for entities.
 *
 * This behavior can impact the performance of your application
 * since it does some additional calculations on persisted objects.
 *
 * We needed to override some private methods, so this is mostly a copy paste of
 * https://github.com/Atlantic18/DoctrineExtensions/blob/v2.4.x/lib/Gedmo/Sluggable/SluggableListener.php
 */
class SluggableListener extends Base
{
    /**
     * List of event adapters used for this listener.
     *
     * @var array
     */
    private $adapters = [];

    /**
     * The power exponent to jump
     * the slug unique number by tens.
     *
     * @var int
     */
    private $exponent = 0;

    /**
     * Transliteration callback for slugs.
     *
     * @var callable
     */
    // We need to avoid calls to getSimilarSlugs in case of empty slug
    // See : https://github.com/Atlantic18/DoctrineExtensions/issues/1478
    private $transliterator = [Transliterator::class, 'transliterate'];

    /**
     * Urlize callback for slugs.
     *
     * @var callable
     */
    private $urlizer = ['Gedmo\Sluggable\Util\Urlizer', 'urlize'];

    /**
     * List of inserted slugs for each object class.
     * This is needed in case there are identical slug
     * composition in number of persisted objects
     * during the same flush.
     *
     * @var array
     */
    private $persisted = [];

    /**
     * List of initialized slug handlers.
     *
     * @var array
     */
    private $handlers = [];

    /**
     * List of filters which are manipulated when slugs are generated.
     *
     * @var array
     */
    private $managedFilters = [];

    /**
     * Specifies the list of events to listen.
     *
     * @return array
     */
    public function getSubscribedEvents()
    {
        return ['onFlush', 'loadClassMetadata', 'prePersist'];
    }

    /**
     * Set the transliteration callable method
     * to transliterate slugs.
     *
     * @param callable $callable
     *
     * @throws \Gedmo\Exception\InvalidArgumentException
     */
    public function setTransliterator($callable)
    {
        if (!\is_callable($callable)) {
            throw new \Gedmo\Exception\InvalidArgumentException('Invalid transliterator callable parameter given');
        }
        $this->transliterator = $callable;
    }

    /**
     * Set the urlization callable method
     * to urlize slugs.
     *
     * @param callable $callable
     */
    public function setUrlizer($callable)
    {
        if (!\is_callable($callable)) {
            throw new \Gedmo\Exception\InvalidArgumentException('Invalid urlizer callable parameter given');
        }
        $this->urlizer = $callable;
    }

    /**
     * Get currently used transliterator callable.
     *
     * @return callable
     */
    public function getTransliterator()
    {
        return $this->transliterator;
    }

    /**
     * Get currently used urlizer callable.
     *
     * @return callable
     */
    public function getUrlizer()
    {
        return $this->urlizer;
    }

    /**
     * Enables or disables the given filter when slugs are generated.
     *
     * @param string $name
     * @param bool   $disable True by default
     */
    public function addManagedFilter($name, $disable = true)
    {
        $this->managedFilters[$name] = ['disabled' => $disable];
    }

    /**
     * Removes a filter from the managed set.
     *
     * @param string $name
     */
    public function removeManagedFilter($name)
    {
        unset($this->managedFilters[$name]);
    }

    /**
     * Mapps additional metadata.
     */
    public function loadClassMetadata(EventArgs $eventArgs)
    {
        $ea = $this->getEventAdapter($eventArgs);
        $this->loadMetadataForObjectClass($ea->getObjectManager(), $eventArgs->getClassMetadata());
    }

    /**
     * Allows identifier fields to be slugged as usual.
     */
    public function prePersist(EventArgs $args)
    {
        $ea = $this->getEventAdapter($args);
        $om = $ea->getObjectManager();
        $object = $ea->getObject();
        $meta = $om->getClassMetadata($object::class);
        if ($config = $this->getConfiguration($om, $meta->name)) {
            foreach ($config['slugs'] as $slugField => $options) {
                if ($meta->isIdentifier($slugField)) {
                    $meta->getReflectionProperty($slugField)->setValue($object, '__id__');
                }
            }
        }
    }

    /**
     * Generate slug on objects being updated during flush
     * if they require changing.
     */
    public function onFlush(EventArgs $args)
    {
        $this->persisted = [];
        $ea = $this->getEventAdapter($args);
        $om = $ea->getObjectManager();
        $uow = $om->getUnitOfWork();
        $this->manageFiltersBeforeGeneration($om);
        // process all objects being inserted, using scheduled insertions instead
        // of prePersist in case if record will be changed before flushing this will
        // ensure correct result. No additional overhead is encountered
        foreach ($ea->getScheduledObjectInsertions($uow) as $object) {
            $meta = $om->getClassMetadata($object::class);
            if ($this->getConfiguration($om, $meta->name)) {
                // generate first to exclude this object from similar persisted slugs result
                $this->generateSlug($ea, $object);
                $this->persisted[$ea->getRootObjectClass($meta)][] = $object;
            }
        }
        // we use onFlush and not preUpdate event to let other
        // event listeners be nested together
        foreach ($ea->getScheduledObjectUpdates($uow) as $object) {
            $meta = $om->getClassMetadata($object::class);
            if ($this->getConfiguration($om, $meta->name) && !$uow->isScheduledForInsert($object)) {
                $this->generateSlug($ea, $object);
                $this->persisted[$ea->getRootObjectClass($meta)][] = $object;
            }
        }
        $this->manageFiltersAfterGeneration($om);
        AbstractWrapper::clear();
    }

    /**
     * Get an event adapter to handle event specific
     * methods.
     *
     * @throws \Gedmo\Exception\InvalidArgumentException - if event is not recognized
     *
     * @return \Gedmo\Mapping\Event\AdapterInterface
     */
    protected function getEventAdapter(EventArgs $args)
    {
        $class = $args::class;
        if (preg_match('@Doctrine\\\([^\\\]+)@', $class, $m) && \in_array($m[1], ['ODM', 'ORM'])) {
            if (!isset($this->adapters[$m[1]])) {
                $this->adapters[$m[1]] = new CapcoORMSluggableAdapter();
            }
            $this->adapters[$m[1]]->setEventArgs($args);

            return $this->adapters[$m[1]];
        }

        throw new \Gedmo\Exception\InvalidArgumentException('Event mapper does not support event arg class: ' . $class);
    }

    /**
     * Get the slug handler instance by $class name.
     *
     * @param string $class
     *
     * @return \Gedmo\Sluggable\Handler\SlugHandlerInterface
     */
    private function getHandler($class)
    {
        if (!isset($this->handlers[$class])) {
            $this->handlers[$class] = new $class($this);
        }

        return $this->handlers[$class];
    }

    /**
     * Creates the slug for object being flushed.
     *
     * @param object $object
     */
    private function generateSlug(SluggableAdapter $ea, $object)
    {
        $om = $ea->getObjectManager();
        $meta = $om->getClassMetadata($object::class);
        $uow = $om->getUnitOfWork();
        $changeSet = $ea->getObjectChangeSet($uow, $object);
        $isInsert = $uow->isScheduledForInsert($object);
        $config = $this->getConfiguration($om, $meta->name);

        foreach ($config['slugs'] as $slugField => $options) {
            $hasHandlers = \count($options['handlers']);
            $options['useObjectClass'] = $config['useObjectClass'];
            // collect the slug from fields
            $slug = $meta->getReflectionProperty($slugField)->getValue($object);
            // if slug should not be updated, skip it
            if (
                !$options['updatable']
                && !$isInsert
                && (!isset($changeSet[$slugField]) || '__id__' === $slug)
            ) {
                continue;
            }
            // must fetch the old slug from changeset, since $object holds the new version
            $oldSlug = isset($changeSet[$slugField]) ? $changeSet[$slugField][0] : $slug;
            $needToChangeSlug = false;
            // if slug is null, regenerate it, or needs an update
            if (null === $slug || '__id__' === $slug || !isset($changeSet[$slugField])) {
                $slug = '';
                foreach ($options['fields'] as $sluggableField) {
                    if (isset($changeSet[$sluggableField]) || isset($changeSet[$slugField])) {
                        $needToChangeSlug = true;
                    }
                    $value = $meta->getReflectionProperty($sluggableField)->getValue($object);
                    // Remove `$value instanceof \DateTime` check when PHP version is bumped to >=5.5
                    $slug .=
                        $value instanceof \DateTime || $value instanceof \DateTimeInterface
                            ? $value->format($options['dateFormat'])
                            : $value;
                    $slug .= ' ';
                }
                // trim generated slug as it will have unnecessary trailing space
                $slug = trim($slug);
            } else {
                // slug was set manually
                $needToChangeSlug = true;
            }
            // notify slug handlers --> onChangeDecision
            if ($hasHandlers) {
                foreach ($options['handlers'] as $class => $handlerOptions) {
                    $this->getHandler($class)->onChangeDecision(
                        $ea,
                        $options,
                        $object,
                        $slug,
                        $needToChangeSlug
                    );
                }
            }
            // if slug is changed, do further processing
            if ($needToChangeSlug) {
                $mapping = $meta->getFieldMapping($slugField);
                // notify slug handlers --> postSlugBuild
                $urlized = false;
                if ($hasHandlers) {
                    foreach ($options['handlers'] as $class => $handlerOptions) {
                        $this->getHandler($class)->postSlugBuild($ea, $options, $object, $slug);
                        if ($this->getHandler($class)->handlesUrlization()) {
                            $urlized = true;
                        }
                    }
                }
                // build the slug
                // Step 1: transliteration, changing 北京 to 'Bei Jing'
                $slug = \call_user_func_array($this->transliterator, [
                    $slug,
                    $options['separator'],
                    $object,
                ]);
                // Step 2: urlization (replace spaces by '-' etc...)
                if (!$urlized) {
                    $slug = \call_user_func_array($this->urlizer, [
                        $slug,
                        $options['separator'],
                        $object,
                    ]);
                }
                // add suffix/prefix
                $slug = $options['prefix'] . $slug . $options['suffix'];
                // Step 3: stylize the slug
                switch ($options['style']) {
                    case 'camel':
                        $quotedSeparator = preg_quote((string) $options['separator']);
                        $slug = preg_replace_callback(
                            '/^[a-z]|' . $quotedSeparator . '[a-z]/smi',
                            function ($m) {
                                return strtoupper($m[0]);
                            },
                            $slug
                        );

                        break;

                    case 'lower':
                        if (\function_exists('mb_strtolower')) {
                            $slug = mb_strtolower($slug);
                        } else {
                            $slug = strtolower($slug);
                        }

                        break;

                    case 'upper':
                        if (\function_exists('mb_strtoupper')) {
                            $slug = mb_strtoupper($slug);
                        } else {
                            $slug = strtoupper($slug);
                        }

                        break;

                    default:
                        // leave it as is
                        break;
                }
                // cut slug if exceeded in length
                if (isset($mapping['length']) && \strlen((string) $slug) > $mapping['length']) {
                    $slug = substr((string) $slug, 0, $mapping['length']);
                }
                if (isset($mapping['nullable']) && $mapping['nullable'] && '' === $slug) {
                    $slug = null;
                }
                // notify slug handlers --> beforeMakingUnique
                if ($hasHandlers) {
                    foreach ($options['handlers'] as $class => $handlerOptions) {
                        $handler = $this->getHandler($class);
                        if ($handler instanceof SlugHandlerWithUniqueCallbackInterface) {
                            $handler->beforeMakingUnique($ea, $options, $object, $slug);
                        }
                    }
                }
                // make unique slug if requested
                if ($options['unique'] && null !== $slug) {
                    $this->exponent = 0;
                    $slug = $this->makeUniqueSlug($ea, $object, $slug, false, $options);
                }
                // notify slug handlers --> onSlugCompletion
                if ($hasHandlers) {
                    foreach ($options['handlers'] as $class => $handlerOptions) {
                        $this->getHandler($class)->onSlugCompletion($ea, $options, $object, $slug);
                    }
                }
                // set the final slug
                $meta->getReflectionProperty($slugField)->setValue($object, $slug);
                // recompute changeset
                $ea->recomputeSingleObjectChangeSet($uow, $meta, $object);
                // overwrite changeset (to set old value)
                $uow->propertyChanged($object, $slugField, $oldSlug, $slug);
            }
        }
    }

    /**
     * Generates the unique slug.
     * This is overriden by @spyl94.
     *
     * @param object $object
     * @param string $preferredSlug
     * @param bool   $recursing
     * @param array  $config[$slugField]
     *
     * @return string - unique slug
     */
    private function makeUniqueSlug(
        SluggableAdapter $ea,
        $object,
        $preferredSlug,
        $recursing = false,
        $config = []
    ) {
        $om = $ea->getObjectManager();
        $meta = $om->getClassMetadata($object::class);
        $similarPersisted = [];
        // extract unique base
        $base = false;
        if ($config['unique'] && isset($config['unique_base'])) {
            $base = $meta->getReflectionProperty($config['unique_base'])->getValue($object);
        }

        // collect similar persisted slugs during this flush
        if (isset($this->persisted[($class = $ea->getRootObjectClass($meta))])) {
            foreach ($this->persisted[$class] as $obj) {
                if (
                    false !== $base
                    && $meta->getReflectionProperty($config['unique_base'])->getValue($obj) !== $base
                ) {
                    continue; // if unique_base field is not the same, do not take slug as similar
                }
                $slug = $meta->getReflectionProperty($config['slug'])->getValue($obj);
                $quotedPreferredSlug = preg_quote($preferredSlug);
                if (preg_match("@^{$quotedPreferredSlug}.*@smi", (string) $slug)) {
                    $similarPersisted[] = [$config['slug'] => $slug];
                }
            }
        }
        // load similar slugs
        $result = array_merge(
            (array) $ea->getSimilarSlugs($object, $meta, $config, $preferredSlug),
            $similarPersisted
        );
        // leave only right slugs
        if (!$recursing) {
            // filter similar slugs
            $quotedSeparator = preg_quote((string) $config['separator']);
            $quotedPreferredSlug = preg_quote($preferredSlug);
            foreach ($result as $key => $similar) {
                if (
                    !preg_match(
                        "@{$quotedPreferredSlug}($|{$quotedSeparator}[\\d]+$)@smi",
                        (string) $similar[$config['slug']]
                    )
                ) {
                    unset($result[$key]);
                }
            }
        }
        if ($result) {
            // We don't want to match similar slugs.
            // This can cause perf issues, so we use a random slug instead.
            if ($object instanceof Proposal) {
                return $preferredSlug . uniqid((string) $config['separator']);
            }

            $generatedSlug = $preferredSlug;
            $sameSlugs = [];
            foreach ((array) $result as $list) {
                $sameSlugs[] = $list[$config['slug']];
            }
            $i = 10 ** $this->exponent;
            if ($recursing || \in_array($generatedSlug, $sameSlugs)) {
                do {
                    $generatedSlug = $preferredSlug . $config['separator'] . $i++;
                } while (\in_array($generatedSlug, $sameSlugs));
            }
            $mapping = $meta->getFieldMapping($config['slug']);
            if (isset($mapping['length']) && \strlen($generatedSlug) > $mapping['length']) {
                $generatedSlug = substr(
                    $generatedSlug,
                    0,
                    $mapping['length'] - (\strlen($i) + \strlen((string) $config['separator']))
                );
                $this->exponent = \strlen($i) - 1;
                if (
                    substr($generatedSlug, -\strlen((string) $config['separator'])) == $config['separator']
                ) {
                    $generatedSlug = substr(
                        $generatedSlug,
                        0,
                        \strlen($generatedSlug) - \strlen((string) $config['separator'])
                    );
                }
                $generatedSlug = $this->makeUniqueSlug($ea, $object, $generatedSlug, true, $config);
            }
            $preferredSlug = $generatedSlug;
        }

        return $preferredSlug;
    }

    private function manageFiltersBeforeGeneration(ObjectManager $om)
    {
        $collection = $this->getFilterCollectionFromObjectManager($om);
        $enabledFilters = array_keys($collection->getEnabledFilters());
        // set each managed filter to desired status
        foreach ($this->managedFilters as $name => &$config) {
            $enabled = \in_array($name, $enabledFilters);
            $config['previouslyEnabled'] = $enabled;
            if ($config['disabled']) {
                if ($enabled) {
                    $collection->disable($name);
                }
            } else {
                $collection->enable($name);
            }
        }
    }

    private function manageFiltersAfterGeneration(ObjectManager $om)
    {
        $collection = $this->getFilterCollectionFromObjectManager($om);
        // Restore managed filters to their original status
        foreach ($this->managedFilters as $name => &$config) {
            if (true === $config['previouslyEnabled']) {
                $collection->enable($name);
            }
            unset($config['previouslyEnabled']);
        }
    }

    /**
     * Retrieves a FilterCollection instance from the given ObjectManager.
     *
     * @throws \Gedmo\Exception\InvalidArgumentException
     *
     * @return mixed
     */
    private function getFilterCollectionFromObjectManager(ObjectManager $om)
    {
        if (\is_callable([$om, 'getFilters'])) {
            return $om->getFilters();
        }
        if (\is_callable([$om, 'getFilterCollection'])) {
            return $om->getFilterCollection();
        }

        throw new \Gedmo\Exception\InvalidArgumentException('ObjectManager does not support filters');
    }
}
