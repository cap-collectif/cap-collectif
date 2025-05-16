<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\CollectStepImapServerConfig;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CollectStepImapServerConfigType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('collectStep', RelayNodeType::class, ['class' => CollectStep::class])
            ->add('serverUrl', TextType::class)
            ->add('folder', TextType::class)
            ->add('email', TextType::class)
            ->add('password', TextType::class)
        ;

        $currentPassword = '';
        $builder->addEventListener(FormEvents::PRE_SET_DATA, function (FormEvent $event) use (&$currentPassword) {
            $config = $event->getData();
            if ($config && $config->getId()) {
                $currentPassword = $config->getPassword();
            }
        });

        $builder->addEventListener(FormEvents::PRE_SUBMIT, function (FormEvent $event) use (&$currentPassword) {
            $data = $event->getData();

            if ('****' === $data['password']) {
                $data['password'] = $currentPassword;
                $event->setData($data);
            }
        });
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => CollectStepImapServerConfig::class,
            'csrf_protection' => false,
        ]);
    }
}
