<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\OpinionType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class OpinionTypeType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'empty_data' => '',
            ])
            ->add('description', TextType::class, [
                'empty_data' => '',
            ])
            ->add('subtitle', TextType::class, [
                'empty_data' => '',
            ])
            ->add('position')
            ->add('isEnabled')
            ->add('sourceable')
            ->add('versionable')
            ->add('defaultFilter')
            ->add('votesHelpText')
            ->add('color')
            ->add('consultation', EntityType::class, ['class' => Consultation::class])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => OpinionType::class,
        ]);
    }
}
