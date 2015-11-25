<?php

namespace Capco\AppBundle\DataDemo;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Persistence\ObjectManager;
use Nelmio\Alice\ProcessorInterface;
use Psr\Log\LoggerInterface;
use Hautelook\AliceBundle\Alice\Doctrine;

/**
 * Loader.
 *
 * @author Baldur Rensch <brensch@gmail.com>
 */
class Loader
{
    /**
     * @var array
     */
    private $providers;

    /**
     * @var ProcessorInterface[]
     */
    private $processors;

    /**
     * @var array
     */
    private $loaders;

    /**
     * @var ObjectManager
     */
    private $objectManager;

    /**
     * @var Doctrine
     */
    private $persister;

    /**
     * @var LoggerInterface
     */
    private $logger;

    /**
     * @var ArrayCollection
     */
    private $references;

    /**
     * @param                 $loaders
     * @param LoggerInterface $logger
     */
    public function __construct($loaders, LoggerInterface $logger = null)
    {
        $this->loaders = $loaders;
        $this->processors = [];
        $this->logger = $logger;
        $this->references = new ArrayCollection();
    }

    /**
     * @param ObjectManager $manager
     */
    public function setObjectManager(ObjectManager $manager)
    {
        $this->objectManager = $manager;

        $this->persister = new Doctrine($this->objectManager);

        $newReferences = [];
        foreach ($this->references as $name => $reference) {
            // Don't merge value objects, e.g. Doctrine embeddables
            if ($this->hasIdentity($reference)) {
                $reference = $this->persister->merge($reference);
            }

            $newReferences[$name] = $reference;
        }
        $this->references = new ArrayCollection($newReferences);

        /** @var $loader \Nelmio\Alice\Loader\Base */
        foreach ($this->loaders as $loader) {
            $loader->setLogger($this->logger);
            $loader->setORM($this->persister);
            $loader->setReferences($newReferences);
        }
    }

    /**
     * @param array<string> $files
     */
    public function load(array $files)
    {
        /** @var $loader \Nelmio\Alice\Loader\Base */
        $loader = $this->getLoader('yaml');
        $loader->setProviders($this->providers);

        $objects = [];
        foreach ($files as $file) {
            $set = $loader->load($file);
            $set = $this->persist($set);

            // replace references with persisted items...
            $references = $loader->getReferences();

            foreach ($references as $name => $obj) {
                if (isset($set[$name])) {
                    $references[$name] = $set[$name];
                }
            }

            $loader->setReferences($references);

            $objects = array_merge($objects, $set);
        }

        foreach ($loader->getReferences() as $name => $obj) {
            $this->persister->detach($obj);
            $this->references->set($name, $obj);
        }

        // remove processors when file is loaded
        $this->processors = [];
    }

    /**
     * @param DataFixtureLoader[] $providers
     */
    public function setProviders(array $providers)
    {
        $this->providers = $providers;
    }

    /**
     * @param ProcessorInterface $processor
     */
    public function addProcessor(ProcessorInterface $processor)
    {
        $this->processors[] = $processor;
    }

    /**
     * @return ArrayCollection
     */
    public function getReferences()
    {
        return $this->references;
    }

    /**
     * @param string $key
     *
     * @throws \InvalidArgumentException
     *
     * @return \Nelmio\Alice\LoaderInterface
     */
    protected function getLoader($key)
    {
        if (empty($this->loaders[$key])) {
            throw new \InvalidArgumentException("Unknown loader type: {$key}");
        }

        /** @var $loader \Nelmio\Alice\LoaderInterface */
        $loader = $this->loaders[$key];

        return $loader;
    }

    /**
     * Persists objects with the preProcess and postProcess methods used by the processors.
     *
     * @param $objects
     */
    private function persist($objects)
    {
        foreach ($this->processors as $processor) {
            foreach ($objects as $key => $obj) {
                if (null !== $return = $processor->preProcess($obj)) {
                    $objects[$key] = $return;
                }
            }
        }

        $this->persister->persist($objects);

        foreach ($this->processors as $processor) {
            foreach ($objects as $obj) {
                $processor->postProcess($obj);
            }
        }

        return $objects;
    }

    /**
     * Returns whether the passed in object has "identity" as defined by Doctrine.
     *
     * @param mixed $reference
     *
     * @return bool
     */
    private function hasIdentity($reference)
    {
        return count($this->objectManager->getClassMetadata(get_class($reference))->getIdentifier()) > 0;
    }
}
