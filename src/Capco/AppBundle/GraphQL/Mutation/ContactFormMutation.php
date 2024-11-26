<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ContactForm\ContactForm;
use Capco\AppBundle\Entity\ContactForm\ContactFormTranslation;
use Capco\AppBundle\Form\ContactFormType;
use Capco\AppBundle\Form\ContactType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Notifier\ContactNotifier;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Exception\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class ContactFormMutation implements MutationInterface
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly LoggerInterface $logger;
    private readonly FormFactoryInterface $formFactory;
    private readonly ContactNotifier $contactNotifier;
    private readonly GlobalIdResolver $globalIdResolver;
    private readonly LocaleRepository $localeRepository;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        ContactNotifier $contactNotifier,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        LocaleRepository $localeRepository
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->formFactory = $formFactory;
        $this->contactNotifier = $contactNotifier;
        $this->globalIdResolver = $globalIdResolver;
        $this->localeRepository = $localeRepository;
    }

    public function send(Argument $input, ?User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
        $id = $arguments['idContactForm'];

        /** @var ContactForm $contactForm */
        $contactForm = $this->globalIdResolver->resolve($id, $viewer);

        if (!$contactForm) {
            throw new UserError(sprintf('Unknown contact form with id "%s"', $id));
        }
        unset($arguments['idContactForm']);

        $form = $this->formFactory->create(ContactType::class);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->contactNotifier->onContact(
            $contactForm->getEmail(),
            $arguments['email'],
            $arguments['name'],
            $arguments['body'],
            $arguments['title'],
            $contactForm->getTitle()
        );
        $this->em->flush();

        return [
            'contactForm' => $contactForm,
        ];
    }

    public function add(Argument $input): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();

        /** @var ContactForm $contactForm */
        $contactForm = new ContactForm();
        LocaleUtils::indexTranslations($arguments);

        $form = $this->formFactory->create(ContactFormType::class, $contactForm);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }
        foreach ($this->localeRepository->findEnabledLocalesCodes() as $availableLocale) {
            if (isset($arguments['translations'][$availableLocale])) {
                $translation = new ContactFormTranslation();
                $translation->setTranslatable($contactForm);
                $translation->setLocale($availableLocale);
                if (isset($arguments['translations'][$availableLocale]['title'])) {
                    $translation->setTitle($arguments['translations'][$availableLocale]['title']);
                }
                if (isset($arguments['translations'][$availableLocale]['body'])) {
                    $translation->setBody($arguments['translations'][$availableLocale]['body']);
                }
                if (isset($arguments['translations'][$availableLocale]['confidentiality'])) {
                    $translation->setConfidentiality(
                        $arguments['translations'][$availableLocale]['confidentiality']
                    );
                }
            }
        }

        $this->em->persist($contactForm);
        $this->em->flush();

        return [
            'contactForm' => $contactForm,
        ];
    }

    public function update(Argument $input, ?User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
        $id = $arguments['id'];

        /** @var ContactForm $contactForm */
        $contactForm = $this->globalIdResolver->resolve($id, $viewer);

        unset($arguments['id']);

        if (!$contactForm) {
            throw new UserError('Contact Form not found.');
        }

        $form = $this->formFactory->create(ContactFormType::class, $contactForm);

        LocaleUtils::indexTranslations($arguments);

        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->flush();
        } catch (DriverException $e) {
            throw new UserError($e->getMessage());
        }

        return [
            'contactForm' => $contactForm,
        ];
    }

    public function remove(Argument $input, ?User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
        $id = $arguments['id'];

        /** @var ContactForm $contactForm */
        $contactForm = $this->globalIdResolver->resolve($id, $viewer);

        if (!$contactForm) {
            throw new UserError('Contact Form not found.');
        }

        try {
            foreach ($contactForm->getTranslations() as $translation) {
                $this->em->remove($translation);
            }
            $this->em->remove($contactForm);
            $this->em->flush();
        } catch (DriverException $e) {
            throw new UserError($e->getMessage());
        }

        return [
            'deletedContactFormId' => $arguments['id'],
        ];
    }
}
