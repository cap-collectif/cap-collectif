<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\IsTrue;

class OpinionsType extends AbstractType
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
                    'mapped'      => false,
                    'label'       => 'opinion.form.confirm',
                    'required'    => true,
                    'constraints' => [new IsTrue(['message' => 'opinion.votes_not_confirmed'])],
                ])
            ;
        }

        $builder
            ->add('title', 'text', [
                'label'    => 'opinion.form.title',
                'required' => true,
            ])
            ->add('body', 'ckeditor', [
                'label'       => 'opinion.form.body',
                'required'    => true,
                'config_name' => 'user_editor',
            ])
            ->add('appendices', 'collection', [
                'type'  => new AppendixType(),
                'label' => false,
            ])
        ;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class'         => 'Capco\AppBundle\Entity\Opinion',
            'csrf_protection'    => true,
            'csrf_field_name'    => '_token',
            'translation_domain' => 'CapcoAppBundle',
            'action' => 'create',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'opinion';
    }
}
