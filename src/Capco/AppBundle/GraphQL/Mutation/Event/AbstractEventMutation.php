<?php

namespace Capco\AppBundle\GraphQL\Mutation\Event;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Form\EventType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

abstract class AbstractEventMutation implements MutationInterface
{
    protected EntityManagerInterface $em;
    protected GlobalIdResolver $globalIdResolver;
    protected FormFactoryInterface $formFactory;
    protected Indexer $indexer;
    protected Publisher $publisher;
    protected AuthorizationCheckerInterface $authorizationChecker;
    protected TranslatorInterface $translator;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Indexer $indexer,
        Publisher $publisher,
        AuthorizationCheckerInterface $authorizationChecker,
        TranslatorInterface $translator
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
        $this->indexer = $indexer;
        $this->publisher = $publisher;
        $this->authorizationChecker = $authorizationChecker;
        $this->translator = $translator;
    }

    public function setDistricts(array &$arguments): void
    {
        if (empty($arguments['districts'])) {
            return;
        }

        $arguments['districts'] = array_map(function ($districtGlobalId) {
            return GlobalId::fromGlobalId($districtGlobalId)['id'];
        }, $arguments['districts']);
    }

    protected function getEvent(string $globalId, User $viewer): Event
    {
        $event = $this->globalIdResolver->resolve($globalId, $viewer);
        if (!($event instanceof Event)) {
            throw new UserError('No event matching id.');
        }

        return $event;
    }

    protected static function checkCustomCode(array $values, User $viewer): void
    {
        if (
            isset($values['customCode'])
            && !empty($values['customCode'])
            && !$viewer->isAdmin()
            && !$viewer->isProjectAdmin()
        ) {
            throw new UserError('You are not authorized to add customCode field.');
        }
    }

    protected function checkDates(array $values): void
    {
        if (
            isset($values['startAt'])
            && !empty($values['startAt'])
            && isset($values['endAt'])
            && !empty($values['endAt'])
            && new \DateTime($values['startAt']) > new \DateTime($values['endAt'])
        ) {
            throw new UserError($this->translator->trans('event-before-date-error'));
        }
    }

    protected function checkRegistrationTypes(array $values): void
    {
        if (isset($values['guestListEnabled']) && !empty($values['guestListEnabled'])) {
            foreach ($values['translations'] as $translation) {
                if (isset($translation['link']) && !empty($translation['link'])) {
                    throw new UserError($this->translator->trans('error-alert-choosing-subscription-mode'));
                }
            }
        }
    }

    protected function getAuthor(array $values, User $viewer): Author
    {
        $authorId = $values['author'] ?? null;

        if (!$authorId) {
            return $viewer;
        }

        $author = $this->globalIdResolver->resolve($authorId, $viewer);

        if (!$author) {
            throw new UserError("No user or organization matching id : {$authorId}");
        }

        if ($viewer->isAdmin()) {
            return $author;
        }
        if ($author instanceof User && $viewer->isAdmin()) {
            return $author;
        }
        if ($author instanceof Organization && $viewer->isMemberOfOrganization($author)) {
            return $author;
        }

        return $viewer;
    }

    protected function setProjects(Event $event, User $viewer, array $values): void
    {
        if (isset($values['projects'])) {
            $event->getProjects()->clear();
            foreach ($values['projects'] as $projectId) {
                $project = $this->globalIdResolver->resolve($projectId, $viewer);
                if ($project) {
                    $event->addProject($project);
                } else {
                    throw new UserError('No project matching id.');
                }
            }
        }
    }

    protected function setSteps(Event $event, User $viewer, array $values): void
    {
        if (isset($values['steps'])) {
            $event->getSteps()->clear();
            foreach ($values['steps'] as $stepId) {
                $step = $this->globalIdResolver->resolve($stepId, $viewer);
                if ($step) {
                    $event->addStep($step);
                } else {
                    throw new UserError('No step matching id.');
                }
            }
        }
    }

    protected function submitEventFormData(
        Event $event,
        array &$values,
        FormFactoryInterface $formFactory
    ): void {
        if (isset($values['startAt'])) {
            $event->setStartAt(new \DateTime($values['startAt']));
            unset($values['startAt']);
        }
        if (isset($values['endAt'])) {
            $event->setEndAt(new \DateTime($values['endAt']));
            unset($values['endAt']);
        }
        if (\array_key_exists('author', $values)) {
            unset($values['author']);
        }
        if (\array_key_exists('animator', $values)) {
            unset($values['animator']);
        }
        if (\array_key_exists('owner', $values)) {
            unset($values['owner']);
        }
        if (\array_key_exists('projects', $values)) {
            unset($values['projects']);
        }
        if (\array_key_exists('steps', $values)) {
            unset($values['steps']);
        }

        $form = $formFactory->create(EventType::class, $event);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }
    }
}
