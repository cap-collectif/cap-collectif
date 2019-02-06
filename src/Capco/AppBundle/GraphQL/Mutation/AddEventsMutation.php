<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Form\EventType;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\UserBundle\Entity\User;
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

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        UserRepository $userRepo,
        ThemeRepository $themeRepo
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->userRepo = $userRepo;
        $this->themeRepo = $themeRepo;
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

                    $form = $this->formFactory->create(EventType::class, $event);
                    $form->submit($eventInput, false);

                    if (!$form->isValid()) {
                        throw GraphQLException::fromFormErrors($form);
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
            'brokenDates' => array_unique($brokenDates),
        ];
    }

    private function checkIsAValidDate($dateString)
    {
        return (bool) strtotime($dateString);
    }
}
