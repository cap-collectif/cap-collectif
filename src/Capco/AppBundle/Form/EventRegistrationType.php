<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\EventRegistration;
use Capco\AppBundle\Translator\FormatterDecorator;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class EventRegistrationType extends AbstractType
{
    private $user;
    private $translator;

    public function __construct(TokenStorageInterface $token, FormatterDecorator $translator)
    {
        $this->user = $token->getToken() ? $token->getToken()->getUser() : null;
        $this->translator = $translator;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($options['registered']) {
            $builder->add('submit', SubmitType::class, [
                'label' => 'event_registration.unsubscribe',
                'attr' => ['class' => 'btn  btn-danger  btn-block']
            ]);

            return;
        }

        if (null !== $this->user && \is_object($this->user)) {
            $builder
                ->add('private', null, [
                    'required' => false,
                    'label' => 'make-my-registration-anonymous'
                ])
                ->add('isPrivacyPolicyAccepted', null, [
                    'required' => true,
                    'label' => $this->translator->trans(
                        $options['adminAuthorizeDataTransferTradKey'],
                        [],
                        'CapcoAppBundle'
                    )
                ])
                ->add('submit', SubmitType::class, [
                    'label' => 'global.register',
                    'attr' => ['class' => 'btn btn-success btn-block']
                ]);

            return;
        }

        $builder
            ->add('username', null, [
                'label' => 'global.name'
            ])
            ->add('email', null, [
                'label' => 'global.email'
            ])
            ->add('private', null, [
                'required' => false,
                'label' => 'make-my-registration-anonymous'
            ])
            ->add('isPrivacyPolicyAccepted', null, [
                'required' => true,
                'label' => $this->translator->trans(
                    $options['adminAuthorizeDataTransferTradKey'],
                    [],
                    'CapcoAppBundle'
                )
            ])
            ->add('submit', SubmitType::class, [
                'label' => 'global.register',
                'attr' => ['class' => 'btn  btn-success  btn-block']
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => EventRegistration::class,
            'translation_domain' => 'CapcoAppBundle',
            'registered' => false,
            'adminAuthorizeDataTransferTradKey' => 'privacy-policy-accepted-2'
        ]);
    }
}
