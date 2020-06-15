<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\EventReview;
use Capco\AppBundle\Entity\EventTranslation;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\Repository\LocaleRepository;
use Doctrine\DBAL\Exception\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Form\EventType;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Symfony\Contracts\Translation\TranslatorInterface;

class AddEventMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $logger;
    private $indexer;
    private $globalIdResolver;
    private $translator;
    private $publisher;
    private $localeRepository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer,
        Publisher $publisher,
        TranslatorInterface $translator,
        LocaleRepository $localeRepository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->globalIdResolver = $globalIdResolver;
        $this->indexer = $indexer;
        $this->translator = $translator;
        $this->publisher = $publisher;
        $this->localeRepository = $localeRepository;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $values = $input->getArrayCopy();

        if (isset($values['customCode']) && !empty($values['customCode']) && !$viewer->isAdmin()) {
            return [
                'eventEdge' => null,
                'userErrors' => [['message' => 'You are not authorized to add customCode field.']],
            ];
        }

        if (self::areDateInvalid($values)) {
            return [
                'eventEdge' => null,
                'userErrors' => [
                    ['message' => $this->translator->trans('event-before-date-error')],
                ],
            ];
        }

        if (self::hasTwoConcurrentRegistrationType($values)) {
            return [
                'eventEdge' => null,
                'userErrors' => [
                    [
                        'message' => $this->translator->trans(
                            'error-alert-choosing-subscription-mode'
                        ),
                    ],
                ],
            ];
        }

        /** @var User $author */
        $author = $viewer;

        if ($viewer->isAdmin() && isset($values['author']) && !empty($values['author'])) {
            $author = $this->globalIdResolver->resolve($values['author'], $viewer);
        }

        // admin or superAdmin can set other user as author
        if ($author && $viewer->isAdmin()) {
            $event = (new Event())->setAuthor($author);
            $event->setEnabled(true);
        } else {
            $event = (new Event())->setAuthor($viewer);
            $event->setReview(new EventReview());
        }

        LocaleUtils::indexTranslations($values);

        static::initEvent($event, $values, $this->formFactory);

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

        $this->indexer->index(\get_class($event), $event->getId());
        $this->indexer->finishBulk();
        if (!$viewer->isAdmin()) {
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

    public static function initEvent(
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
        if (isset($values['author'])) {
            unset($values['author']);
        }

        $form = $formFactory->create(EventType::class, $event);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }
    }

    private static function areDateInvalid(array $values): bool
    {
        return isset($values['startAt']) &&
            !empty($values['startAt']) &&
            isset($values['endAt']) &&
            !empty($values['endAt']) &&
            new \DateTime($values['startAt']) > new \DateTime($values['endAt']);
    }

    private static function hasTwoConcurrentRegistrationType(array $values): bool
    {
        if (isset($values['guestListEnabled']) && !empty($values['guestListEnabled'])) {
            foreach ($values['translations'] as $translation) {
                if (isset($translation['link']) && !empty($translation['link'])) {
                    return true;
                }
            }
        }

        return false;
    }
}
