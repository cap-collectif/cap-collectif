<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventTranslation;
use Capco\AppBundle\Form\EventType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Event\AbstractEventMutation;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Utils\Map;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class AddEventsMutation extends AbstractEventMutation
{
    use MutationTrait;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Indexer $indexer,
        Publisher $publisher,
        AuthorizationCheckerInterface $authorizationChecker,
        TranslatorInterface $translator,
        private readonly LocaleRepository $localeRepository,
        private readonly UserRepository $userRepo,
        private readonly ThemeRepository $themeRepo,
        private readonly ProjectRepository $projectRepository,
        private readonly SettableOwnerResolver $settableOwnerResolver,
        private readonly Map $map,
        private readonly GlobalDistrictRepository $globalDistrictRepository
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
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $importedEvents = [];
        $notFoundEmails = [];
        $notFoundThemes = [];
        $notFoundDistricts = [];
        $notFoundProjects = [];
        $brokenDates = [];

        foreach ($input->offsetGet('events') as $eventInput) {
            foreach ($eventInput as &$ev) {
                $ev = '' === $ev ? null : $ev;
            }
            unset($ev);
            $this->defaultTranslation($eventInput);

            $this->handleAddress($eventInput);

            /** @var User $user */
            $author = $this->userRepo->findOneByEmail($eventInput['authorEmail'] ?? '');

            $eventInput['startAt'] = $eventInput['startAt']
                ? $this->parseStringDate($eventInput['startAt'])
                : null;
            $eventInput['endAt'] = $eventInput['endAt']
                ? $this->parseStringDate($eventInput['endAt'])
                : null;

            if (null === $eventInput['startAt']) {
                $brokenDates[] = null;
            }

            $hasDates = $eventInput['startAt'] && $eventInput['endAt'];

            if ($author) {
                unset($eventInput['authorEmail']);

                if (\is_array($eventInput['themes']) && !empty($eventInput['themes'])) {
                    $themeIds = [];
                    foreach ($eventInput['themes'] as $key => $themeTitle) {
                        $theme = $this->themeRepo->findOneWithTitle($themeTitle);
                        if (!$theme) {
                            $notFoundThemes[] = $themeTitle;
                            unset($eventInput['themes'][$key]);

                            continue;
                        }
                        $themeIds[] = $theme->getId();
                    }
                    $eventInput['themes'] = $themeIds;
                }

                if (\is_array($eventInput['districts']) && !empty($eventInput['districts'])) {
                    $districtIds = [];
                    foreach ($eventInput['districts'] as $key => $districtTitle) {
                        $district = $this->globalDistrictRepository->findOneByTitle($districtTitle);
                        if (!$district) {
                            $notFoundDistricts[] = $districtTitle;
                            unset($eventInput['districts'][$key]);

                            continue;
                        }
                        $districtIds[] = $district->getId();
                    }
                    $eventInput['districts'] = $districtIds;
                }

                if ($this->validateDates($eventInput['startAt'], $eventInput['endAt'])) {
                    $event = (new Event())
                        ->setAuthor($author)
                        ->setOwner(
                            $this->settableOwnerResolver->__invoke(
                                $input->offsetGet('owner'),
                                $viewer
                            )
                        )
                        ->setCreator($viewer)
                    ;

                    if (\is_array($eventInput['projects']) && !empty($eventInput['projects'])) {
                        foreach ($eventInput['projects'] as $key => $projectTitle) {
                            $project = $this->projectRepository->findOneBy([
                                'title' => $projectTitle,
                            ]);
                            if (!$project) {
                                $notFoundProjects[] = $projectTitle;
                                unset($eventInput['projects'][$key]);

                                continue;
                            }
                            $event->addProject($project);
                        }
                    }
                    unset($eventInput['projects']);

                    $this->setSteps($event, $viewer, $eventInput);
                    unset($eventInput['steps']);

                    LocaleUtils::indexTranslations($eventInput);

                    $form = $this->formFactory->create(EventType::class, $event);
                    $form->submit($eventInput, false);
                    if ($form->isSubmitted() && !$form->isValid()) {
                        throw GraphQLException::fromFormErrors($form);
                    }

                    foreach (
                        $this->localeRepository->findEnabledLocalesCodes()
                        as $availableLocale
                    ) {
                        if (
                            isset($eventInput['translations'][$availableLocale])
                            && null === $event->translate($availableLocale)
                        ) {
                            $translation = new EventTranslation();
                            $translation->setTranslatable($event);
                            $event->addTranslation($translation);
                            $translation->setLocale($availableLocale);
                            if (isset($eventInput['translations'][$availableLocale]['title'])) {
                                $translation->setTitle(
                                    $eventInput['translations'][$availableLocale]['title']
                                );
                            }
                            if (isset($eventInput['translations'][$availableLocale]['body'])) {
                                $translation->setBody(
                                    $eventInput['translations'][$availableLocale]['body']
                                );
                            }
                            if (
                                isset(
                                    $eventInput['translations'][$availableLocale]['metaDescription']
                                )
                            ) {
                                $translation->setMetaDescription(
                                    $eventInput['translations'][$availableLocale]['metaDescription']
                                );
                            }
                            if (isset($eventInput['translations'][$availableLocale]['link'])) {
                                $translation->setLink(
                                    $eventInput['translations'][$availableLocale]['link']
                                );
                            }
                        }
                    }
                    $this->em->persist($event);

                    $importedEvents[] = $event;
                } else {
                    $brokenDates[] = $this->checkIsAValidDate($eventInput['startAt'])
                        ? $eventInput['endAt']
                        : $eventInput['startAt'];
                }
            } else {
                $notFoundEmails[] = $eventInput['authorEmail'];
            }
        }

        if (false === $input->offsetGet('dryRun')) {
            $this->em->flush();
        }

        return [
            'importedEvents' => $importedEvents,
            'userErrors' => [],
            'notFoundEmails' => array_unique($notFoundEmails),
            'notFoundThemes' => array_unique($notFoundThemes),
            'notFoundProjects' => array_unique($notFoundProjects),
            'brokenDates' => array_unique($brokenDates),
            'notFoundDistricts' => array_unique($notFoundDistricts),
        ];
    }

    public function validateDates(string $startAt, ?string $endAt): bool
    {
        if ($endAt) {
            return $this->checkIsAValidDate($startAt) && $this->checkIsAValidDate($endAt);
        }

        return $this->checkIsAValidDate($startAt);
    }

    private function checkIsAValidDate($dateString)
    {
        return (bool) strtotime((string) $dateString);
    }

    /**
     * allow retro-compatibility for imports.
     */
    private function defaultTranslation(array &$values): array
    {
        if (empty($values['translations'])) {
            if ($values['title'] && $values['body']) {
                $values['translations'][] = [
                    'title' => $values['title'],
                    'body' => $values['body'],
                    'metaDescription' => $values['metaDescription'],
                    'link' => $values['link'],
                    'locale' => $this->localeRepository->getDefaultCode(),
                ];
                unset(
                    $values['title'],
                    $values['body'],
                    $values['metaDescription'],
                    $values['link']
                );
            } else {
                throw new UserError('must provide title and body');
            }
        }

        return $values;
    }

    private function parseStringDate(string $stringDate): string
    {
        $stringDate = str_replace('/', '-', $stringDate);

        return (new \DateTime($stringDate))->format('Y-m-d H:i:s');
    }

    private function handleAddress(array &$eventInput): void
    {
        $address = $eventInput['address'] ?? '';
        $zipCode = $eventInput['zipCode'] ?? '';
        $city = $eventInput['city'] ?? '';
        $country = $eventInput['country'] ?? '';

        if (!$address) {
            $addressJson = $this->map->getFormattedAddress("{$zipCode} {$city} {$country}");
            if (!$addressJson) {
                return;
            }
            $addressJsonArray = json_decode((string) $addressJson, true);
            if (!$addressJsonArray) {
                return;
            }
            $eventInput['address'] = $addressJsonArray[0]['formatted_address'];
            $eventInput['addressJson'] = $addressJson;

            return;
        }
        $addressJson = $this->map->getFormattedAddress("{$address} {$zipCode} {$city} {$country}");
        $eventInput['addressJson'] = $addressJson;
    }
}
