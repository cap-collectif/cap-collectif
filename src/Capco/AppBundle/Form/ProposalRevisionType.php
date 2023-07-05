<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\ProposalRevision;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalRevisionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('reason', TextType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('body', TextareaType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('bodyUsingJoditWysiwyg')
            ->add('expiresAt', DateTimeType::class, [
                'required' => true,
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ProposalRevision::class,
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
            'actionType' => 'create',
        ]);
    }

    public function getBlockPrefix()
    {
        return '';
    }
}
