<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use GraphQL\Error\UserError;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\ContactType;
use Capco\AppBundle\Entity\ContactForm;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Form\ContactFormType;
use Doctrine\DBAL\Exception\DriverException;
use Capco\AppBundle\Notifier\ContactNotifier;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class ContactFormMutation implements MutationInterface
{
    private $em;
    private $logger;
    private $formFactory;
    private $contactNotifier;
    private $globalIdResolver;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        ContactNotifier $contactNotifier,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->formFactory = $formFactory;
        $this->contactNotifier = $contactNotifier;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function send(Argument $input, ?User $viewer): array
    {
        $arguments = $input->getRawArguments();
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
            '',
            $arguments['title'],
            $contactForm->getTitle()
        );
        $this->em->flush();

        return [
            'contactForm' => $contactForm,
        ];
    }

    public function add(Argument $input)
    {
        $arguments = $input->getRawArguments();

        /** @var ContactForm $contactForm */
        $contactForm = new ContactForm();

        $form = $this->formFactory->create(ContactFormType::class, $contactForm);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->persist($contactForm);
            $this->em->flush();
        } catch (DriverException $e) {
            throw new UserError($e->getMessage());
        }

        return [
            'contactForm' => $contactForm,
        ];
    }

    public function update(Argument $input, ?User $viewer)
    {
        $arguments = $input->getRawArguments();
        $id = $arguments['id'];

        /** @var ContactForm $contactForm */
        $contactForm = $this->globalIdResolver->resolve($id, $viewer);

        unset($arguments['id']);

        if (!$contactForm) {
            throw new UserError('Contact Form not found.');
        }

        $form = $this->formFactory->create(ContactFormType::class, $contactForm);
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

    public function remove(Argument $input, ?User $viewer)
    {
        $arguments = $input->getRawArguments();
        $id = $arguments['id'];

        /** @var ContactForm $contactForm */
        $contactForm = $this->globalIdResolver->resolve($id, $viewer);

        if (!$contactForm) {
            throw new UserError('Contact Form not found.');
        }

        try {
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
