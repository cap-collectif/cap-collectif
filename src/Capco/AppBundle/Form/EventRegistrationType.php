<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

use Capco\UserBundle\Entity\User;

class EventRegistrationType extends AbstractType
{

    private $user;
    private $registered;

    public function __construct(User $user = null, $registered) {

        $this->user = $user;
        $this->registered = $registered;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->registered) {
            $builder->add('submit', 'submit', [
              'label' => 'event_registration.unsubscribe',
              'attr' => ['class' => 'btn  btn-danger  btn-block']
            ]);

          return;
        }



        if ($this->user != null) {

            $builder
              ->add('private', null, [
                  'required' => false,
                  'label' => 'event_registration.create.private'
              ])
              ->add('submit', 'submit', [
                  'label' => 'event_registration.create.register',
                  'attr' => ['class' => 'btn btn-success btn-block']
              ])
            ;

            return;
        }

        $builder
            ->add('username', null, [
                  'label' => 'event_registration.create.name'
            ])
            ->add('email', null, [
                  'label' => 'event_registration.create.email'
            ])
            ->add('private', null, [
                  'required' => false,
                  'label' => 'event_registration.create.private'
            ])
            ->add('submit', 'submit', [
                  'label' => 'event_registration.create.submit',
                  'attr' => ['class' => 'btn  btn-success  btn-block']
            ])
        ;

    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Capco\AppBundle\Entity\EventRegistration',
            'translation_domain' => 'CapcoAppBundle'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_event_registration';
    }
}
