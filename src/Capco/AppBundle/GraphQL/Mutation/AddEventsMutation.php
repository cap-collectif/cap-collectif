<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventTranslation;
use Capco\AppBundle\Form\EventType;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddEventsMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $userRepo;
    private $themeRepo;
    private $localeRepository;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        UserRepository $userRepo,
        ThemeRepository $themeRepo,
        LocaleRepository $localeRepository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->userRepo = $userRepo;
        $this->themeRepo = $themeRepo;
        $this->localeRepository = $localeRepository;
    }

    public function __invoke(Arg $input): array
    {
        $importedEvents = [];
        $notFoundEmails = [];
        $notFoundThemes = [];
        $brokenDates = [];

        foreach ($input->offsetGet('events') as $eventInput) {
            foreach ($eventInput as &$ev) {
                $ev = '' === $ev ? null : $ev;
            }
            unset($ev);
            $this->defaultTranslation($eventInput);

            /** @var User $user */
            $author = $this->userRepo->findOneByEmail($eventInput['authorEmail']);

            if ($author) {
                unset($eventInput['authorEmail']);

                if (\is_array($eventInput['themes']) && !empty($eventInput['themes'])) {
                    foreach ($eventInput['themes'] as $key => $themeId) {
                        $theme = $this->themeRepo->find($themeId);
                        if (!$theme) {
                            $notFoundThemes[] = $themeId;
                            unset($eventInput['themes'][$key]);
                        }
                    }
                }

                if (
                    $this->checkIsAValidDate($eventInput['startAt']) &&
                    $this->checkIsAValidDate($eventInput['endAt'])
                ) {
                    $event = (new Event())->setAuthor($author);

                    LocaleUtils::indexTranslations($eventInput);

                    $form = $this->formFactory->create(EventType::class, $event);
                    $form->submit($eventInput, false);
                    if (!$form->isValid()) {
                        throw GraphQLException::fromFormErrors($form);
                    }

                    foreach (
                        $this->localeRepository->findEnabledLocalesCodes()
                        as $availableLocale
                    ) {
                        if (
                            isset($eventInput['translations'][$availableLocale]) &&
                            null === $event->translate($availableLocale)
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
            'brokenDates' => array_unique($brokenDates)
        ];
    }

    private function checkIsAValidDate($dateString)
    {
        return (bool) strtotime($dateString);
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
                    'locale' => $this->localeRepository->getDefaultCode()
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
}
