<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Form\EventReviewType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\EventReviewVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ReviewEventMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private GlobalIdResolver $globalIdResolver,
        private EntityManagerInterface $em,
        private FormFactoryInterface $formFactory,
        private LoggerInterface $logger,
        private Indexer $indexer,
        private Publisher $publisher,
        private AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    public function __invoke(Arg $input, User $reviewer): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();

        /** @var Event $event */
        $event = $this->globalIdResolver->resolve($values['id'], $reviewer);
        if (!$event) {
            return [
                'event' => null,
                'userErrors' => [['message' => 'Could not find your event.']],
            ];
        }
        $review = $event->getReview();
        if (!$review || !$this->authorizationChecker->isGranted(EventReviewVoter::EDIT, $review)) {
            return [
                'event' => null,
                'userErrors' => [['message' => 'Access denied']],
            ];
        }
        unset($values['id']);
        $values['reviewer'] = $reviewer->getId();

        $form = $this->formFactory->create(EventReviewType::class, $review);
        $form->submit($values, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        $this->indexer->index(ClassUtils::getClass($event), $event->getId());
        $this->indexer->finishBulk();

        if (!$event->getAuthor()->isAdmin() && $reviewer->isAdmin()) {
            $this->publisher->publish(
                'event.review',
                new Message(
                    json_encode([
                        'eventId' => $event->getId(),
                    ])
                )
            );
        }

        // TODO send review notification to user
        return ['event' => $event, 'userErrors' => []];
    }
}
