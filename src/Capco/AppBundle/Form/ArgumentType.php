<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\IsTrue;

class ArgumentType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($options['action'] === 'edit') {
            $builder
                ->add('confirm', 'checkbox', [
                    'mapped' => false,
                    'required' => true,
                    'constraints' => [new IsTrue(['message' => 'argument.votes_not_confirmed'])],
                ])
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
            'action' => 'create',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'argument';
    }
}
