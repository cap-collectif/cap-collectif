<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\EventRegistration;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class EventRegistrationType extends AbstractType
{
    private $user;

    public function __construct(TokenStorageInterface $token)
    {
        $this->user = $token->getToken() ? $token->getToken()->getUser() : null;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($options['registered']) {
            $builder->add('submit', SubmitType::class, [
              'label' => 'event_registration.unsubscribe',
              'attr' => ['class' => 'btn  btn-danger  btn-block'],
            ]);

            return;
        }

        if (null !== $this->user || !\is_object($this->user)) {
            $builder
              ->add('private', null, [
                  'required' => false,
                  'label' => 'event_registration.create.private',
              ])
              ->add('submit',
                  SubmitType::class, [
                  'label' => 'event_registration.create.register',
                  'attr' => ['class' => 'btn btn-success btn-block'],
              ])
            ;

            return;
        }

        $builder
            ->add('username', null, [
                'label' => 'event_registration.create.name',
            ])
            ->add('email', null, [
                'label' => 'event_registration.create.email',
            ])
            ->add('private', null, [
                'required' => false,
                'label' => 'event_registration.create.private',
            ])
            ->add('submit',
                SubmitType::class, [
                  'label' => 'event_registration.create.submit',
                  'attr' => ['class' => 'btn  btn-success  btn-block'],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => EventRegistration::class,
            'translation_domain' => 'CapcoAppBundle',
            'registered' => false,
        ]);
    }
}
