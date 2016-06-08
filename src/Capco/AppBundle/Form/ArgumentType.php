<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvents;

class ArgumentType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($options['actionType'] === 'edit') {
            $builder
                ->add('confirm', 'checkbox', [
                    'mapped' => false,
                    'required' => true,
                ])
                ->addEventListener(FormEvents::POST_SUBMIT, function (FormEvent $event) {
                    $form = $event->getForm();
                    $confirm = $form->get('confirm')->getData();
                    if (empty($confirm)) {
                        $form['confirm']->addError(new FormError('argument.votes_not_confirmed'));
                    }
                })
            ;
        }

        $builder
            ->add('body', 'textarea', [
                'required' => true,
            ])
            ->add('type', 'integer', [
                'required' => true,
            ])
        ;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Argument',
            'csrf_protection' => false,
            'actionType' => 'create',
        ]);
        $resolver->setRequired('actionType');
        $resolver->setAllowedValues('actionType', ['create', 'edit']);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'argument';
    }
}
