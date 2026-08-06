<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\HubMetadata;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;

class HubMetadataType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $required = $options['hub_metadata_required'];

        $builder
            ->add('enabled', CheckboxType::class)
            ->add('aiotCode', TextType::class, [
                'required' => $required,
                'constraints' => $required ? [new NotBlank()] : [],
            ])
            ->add('folderNumber', TextType::class, [
                'required' => $required,
                'constraints' => $required ? [new NotBlank()] : [],
            ])
            ->add('contactEmail', EmailType::class, [
                'required' => $required,
                'constraints' => $required ? [new NotBlank(), new Email()] : [],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => HubMetadata::class,
            'csrf_protection' => false,
            'hub_metadata_required' => false,
        ]);
        $resolver->setAllowedTypes('hub_metadata_required', 'bool');
    }
}
