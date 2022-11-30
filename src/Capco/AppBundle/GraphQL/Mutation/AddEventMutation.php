<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\EventReview;
use Capco\AppBundle\Entity\EventTranslation;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Mutation\Event\AbstractEventMutation;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\EventVoter;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\DBAL\Exception\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class AddEventMutation extends AbstractEventMutation
{
    private SettableOwnerResolver $settableOwnerResolver;
    private LocaleRepository $localeRepository;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Indexer $indexer,
        Publisher $publisher,
        AuthorizationCheckerInterface $authorizationChecker,
        TranslatorInterface $translator,
        SettableOwnerResolver $settableOwnerResolver,
        LocaleRepository $localeRepository
    ) {
        parent::__construct(
            $em,
            $globalIdResolver,
            $formFactory,
            $indexer,
            $publisher,
            $authorizationChecker,
            $translator
        );
        $this->settableOwnerResolver = $settableOwnerResolver;
        $this->localeRepository = $localeRepository;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $values = $input->getArrayCopy();

        try {
            self::checkCustomCode($values, $viewer);
            self::checkDates($values);
            self::checkRegistrationTypes($values);
            $event = new Event();
            $event->setOwner(
                $this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer)
            );
            $event->setCreator($viewer);
            $author = $this->getAuthor($values, $viewer);
            $event->setAuthor($author);
            LocaleUtils::indexTranslations($values);
            $this->setProjects($event, $viewer, $values);
            $this->setSteps($event, $viewer, $values);

            if ($viewer->isOnlyUser() && !$viewer->isOrganizationMember()) {
                $event->setReview(new EventReview());
            }
            $this->submitEventFormData($event, $values, $this->formFactory);
        } catch (UserError $error) {
            return [
                'eventEdge' => null,
                'userErrors' => [['message' => $error->getMessage()]],
            ];
        }

        foreach ($this->localeRepository->findEnabledLocalesCodes() as $availableLocale) {
            if (isset($values['translations'][$availableLocale])) {
                $translation = new EventTranslation();
                $translation->setTranslatable($event);
                $translation->setLocale($availableLocale);
                if (isset($values['translations'][$availableLocale]['title'])) {
                    $translation->setTitle($values['translations'][$availableLocale]['title']);
                }
                if (isset($values['translations'][$availableLocale]['body'])) {
                    $translation->setBody($values['translations'][$availableLocale]['body']);
                }
                if (isset($values['translations'][$availableLocale]['metaDescription'])) {
                    $translation->setMetaDescription(
                        $values['translations'][$availableLocale]['metaDescription']
                    );
                }
                if (isset($values['translations'][$availableLocale]['link'])) {
                    $translation->setLink($values['translations'][$availableLocale]['link']);
                }
            }
        }

        try {
            $this->em->persist($event);
            $this->em->flush();
        } catch (DriverException $e) {
            throw new UserError($e->getMessage());
        }

        $this->indexer->index(ClassUtils::getClass($event), $event->getId());
        $this->indexer->finishBulk();
        if (!$viewer->isProjectAdmin()) {
            $this->publisher->publish(
                'event.create',
                new Message(
                    json_encode([
                        'eventId' => $event->getId(),
                    ])
                )
            );
        }

        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $event);

        return ['eventEdge' => $edge, 'userErrors' => []];
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(EventVoter::CREATE, new Event());
    }

    private function getAuthor(array $values, User $viewer): Author
    {
        $authorId = $values['author'] ?? null;

        if (!$authorId) {
            return $viewer;
        }

        $author = $this->globalIdResolver->resolve($authorId, $viewer);

        if (!$author) {
            throw new UserError("No user or organization matching id : {$authorId}");
        }

        if ($author instanceof User && $viewer->isAdmin()) {
            return $author;
        }
        if ($author instanceof Organization && $viewer->isMemberOfOrganization($author)) {
            return $author;
        }

        return $viewer;
    }
}
