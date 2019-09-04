<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AdminBundle\Timezone\GlobalConfigurationTimeZoneDetector;
use Capco\AppBundle\Elasticsearch\Indexer;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class ChangeEventMutation implements MutationInterface
{
    private $em;
    private $globalIdResolver;
    private $formFactory;
    private $logger;
    private $indexer;
    private $configurationTimeZoneDetector;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        Indexer $indexer,
        GlobalConfigurationTimeZoneDetector $configurationTimeZoneDetector
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->indexer = $indexer;
        $this->configurationTimeZoneDetector = $configurationTimeZoneDetector;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $values = $input->getArrayCopy();

        if (isset($values['customCode']) && !empty($values['customCode']) && !$viewer->isAdmin()) {
            return [
                'event' => null,
                'userErrors' => [['message' => 'You are not authorized to add customCode field.']]
            ];
        }

        /** @var Event $event */
        $event = $this->globalIdResolver->resolve($values['id'], $viewer);
        if (!$event) {
            return [
                'event' => null,
                'userErrors' => [['message' => 'Could not find your event.']]
            ];
        }

        unset($values['id']);
        /** @var User $newAuthor */
        $newAuthor = isset($values['author'])
            ? $this->globalIdResolver->resolve($values['author'], $viewer)
            : null;

        // admin and superAdmin can change the event's author
        if ($newAuthor && $viewer->isAdmin() && $newAuthor !== $event->getAuthor()) {
            $event->setAuthor($newAuthor);
        }

        $event = AddEventMutation::initEvent(
            $event,
            $values,
            $this->formFactory,
            $this->configurationTimeZoneDetector->getTimezone()
        );

        $this->em->flush();

        $this->indexer->index(\get_class($event), $event->getId());
        $this->indexer->finishBulk();

        return ['event' => $event, 'userErrors' => []];
    }
}
