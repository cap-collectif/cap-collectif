<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class OpinionVersionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
                'constraints' => [
                    new Assert\NotNull(),
                    new Assert\NotBlank(),
                    new Assert\Length(['min' => 2]),
                ],
            ])
            ->add('body', TextareaType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
                'constraints' => [
                    new Assert\NotNull(),
                    new Assert\NotBlank(),
                    new Assert\Length(['min' => 2]),
                ],
            ])
            ->add('comment', TextareaType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
                'constraints' => [
                    new Assert\NotNull(),
                    new Assert\NotBlank(),
                    new Assert\Length(['min' => 2]),
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\OpinionVersion',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }
}
