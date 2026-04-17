<?php

namespace Capco\AppBundle\Form\Persister\ProjectTab;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectTab;
use Capco\AppBundle\Entity\ProjectTabCustom;
use Capco\AppBundle\Entity\ProjectTabEventItem;
use Capco\AppBundle\Entity\ProjectTabEvents;
use Capco\AppBundle\Entity\ProjectTabNews;
use Capco\AppBundle\Entity\ProjectTabNewsItem;
use Capco\AppBundle\Entity\ProjectTabPresentation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProjectTabRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\String\Slugger\SluggerInterface;

abstract class AbstractProjectTabPersister
{
    public const PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND';
    public const PROJECT_TAB_NOT_FOUND = 'PROJECT_TAB_NOT_FOUND';
    public const SLUG_ALREADY_EXISTS = 'SLUG_ALREADY_EXISTS';
    public const PRESENTATION_ALREADY_EXISTS = 'PRESENTATION_ALREADY_EXISTS';
    public const BODY_REQUIRED = 'BODY_REQUIRED';
    public const NEWS_ITEMS_REQUIRED = 'NEWS_ITEMS_REQUIRED';
    public const EVENT_ITEMS_REQUIRED = 'EVENT_ITEMS_REQUIRED';
    public const INVALID_NEWS_ITEMS = 'INVALID_NEWS_ITEMS';
    public const INVALID_EVENT_ITEMS = 'INVALID_EVENT_ITEMS';
    public const INVALID_TAB_TYPE = 'INVALID_TAB_TYPE';
    public const INVALID_REORDER = 'INVALID_REORDER';

    public function __construct(
        protected readonly EntityManagerInterface $em,
        protected readonly GlobalIdResolver $globalIdResolver,
        protected readonly SluggerInterface $slugger
    ) {
    }

    protected function getProject(string $projectId, User $viewer): ?Project
    {
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        return $project instanceof Project ? $project : null;
    }

    protected function getProjectTab(string $tabId, User $viewer): ?ProjectTab
    {
        $decodedId = GlobalIdResolver::getDecodedId($tabId, true);
        $tab = \is_string($decodedId) ? $this->em->getRepository(ProjectTab::class)->find($decodedId) : null;

        return $tab instanceof ProjectTab ? $tab : null;
    }

    protected function normalizeSlug(string $slug): string
    {
        return $this->slugger->slug($slug)->lower()->toString();
    }

    protected function validateCommonFields(ProjectTab $projectTab, Argument $input, ?ProjectTab $excludedTab = null): ?string
    {
        $normalizedSlug = $this->normalizeSlug((string) $input->offsetGet('slug'));

        if ($this->getProjectTabRepository()->isSlugUsedInProject($projectTab->getProject(), $normalizedSlug, $excludedTab)) {
            return self::SLUG_ALREADY_EXISTS;
        }

        if (
            ($projectTab instanceof ProjectTabPresentation)
            && $this->getProjectTabRepository()->hasPresentationTab($projectTab->getProject(), $excludedTab)
        ) {
            return self::PRESENTATION_ALREADY_EXISTS;
        }

        $projectTab
            ->setTitle((string) $input->offsetGet('title'))
            ->setSlug($normalizedSlug)
            ->setEnabled((bool) $input->offsetGet('enabled'))
        ;

        return null;
    }

    protected function validateBody(ProjectTab $projectTab, Argument $input): ?string
    {
        if (!$projectTab instanceof ProjectTabPresentation && !$projectTab instanceof ProjectTabCustom) {
            return null;
        }

        $body = $input->offsetExists('body') ? $input->offsetGet('body') : null;
        if (null !== $body && '' !== trim((string) $body)) {
            $projectTab->setBody((string) $body);
        }

        return null;
    }

    protected function replaceNewsItems(ProjectTabNews $projectTab, Argument $input, User $viewer): ?string
    {
        if (!$input->offsetExists('newsItems') || null === $input->offsetGet('newsItems')) {
            return self::NEWS_ITEMS_REQUIRED;
        }

        $items = $input->offsetGet('newsItems');
        if (!\is_array($items)) {
            return self::INVALID_NEWS_ITEMS;
        }

        $seenPostIds = [];
        $seenPositions = [];
        $newItems = [];
        foreach ($items as $itemInput) {
            $item = $itemInput instanceof Argument ? $itemInput : new Argument($itemInput);
            $post = $this->globalIdResolver->resolve((string) $item->offsetGet('id'), $viewer);
            $position = (int) $item->offsetGet('position');

            if (!$post instanceof Post) {
                return self::INVALID_NEWS_ITEMS;
            }

            if (\in_array($post->getId(), $seenPostIds, true)) {
                return self::INVALID_NEWS_ITEMS;
            }
            $seenPostIds[] = $post->getId();

            if (\in_array($position, $seenPositions, true)) {
                return self::INVALID_NEWS_ITEMS;
            }
            $seenPositions[] = $position;

            $newItems[] = (new ProjectTabNewsItem())
                ->setProjectTab($projectTab)
                ->setPost($post)
                ->setPosition($position)
            ;
        }

        foreach ($projectTab->getNewsItems()->toArray() as $newsItem) {
            $projectTab->removeNewsItem($newsItem);
            $this->em->remove($newsItem);
        }
        $this->em->flush();

        foreach ($newItems as $newsItem) {
            $projectTab->addNewsItem($newsItem);
        }

        return null;
    }

    protected function replaceEventItems(ProjectTabEvents $projectTab, Argument $input, User $viewer): ?string
    {
        if (!$input->offsetExists('eventItems') || null === $input->offsetGet('eventItems')) {
            return self::EVENT_ITEMS_REQUIRED;
        }

        $items = $input->offsetGet('eventItems');
        if (!\is_array($items)) {
            return self::INVALID_EVENT_ITEMS;
        }

        $seenEventIds = [];
        $seenPositions = [];
        $newItems = [];
        foreach ($items as $itemInput) {
            $item = $itemInput instanceof Argument ? $itemInput : new Argument($itemInput);
            $event = $this->globalIdResolver->resolve((string) $item->offsetGet('id'), $viewer);
            $position = (int) $item->offsetGet('position');

            if (!$event instanceof Event) {
                return self::INVALID_EVENT_ITEMS;
            }

            if (\in_array($event->getId(), $seenEventIds, true)) {
                return self::INVALID_EVENT_ITEMS;
            }
            $seenEventIds[] = $event->getId();

            if (\in_array($position, $seenPositions, true)) {
                return self::INVALID_EVENT_ITEMS;
            }
            $seenPositions[] = $position;

            $newItems[] = (new ProjectTabEventItem())
                ->setProjectTab($projectTab)
                ->setEvent($event)
                ->setPosition($position)
            ;
        }

        foreach ($projectTab->getEventItems()->toArray() as $eventItem) {
            $projectTab->removeEventItem($eventItem);
            $this->em->remove($eventItem);
        }
        $this->em->flush();

        foreach ($newItems as $eventItem) {
            $projectTab->addEventItem($eventItem);
        }

        return null;
    }

    private function getProjectTabRepository(): ProjectTabRepository
    {
        $projectTabRepository = $this->em->getRepository(ProjectTab::class);
        \assert($projectTabRepository instanceof ProjectTabRepository);

        return $projectTabRepository;
    }
}
