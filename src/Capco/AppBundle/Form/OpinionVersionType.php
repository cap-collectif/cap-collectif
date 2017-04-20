<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class OpinionVersionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class, [
                'constraints' => [
                  new Assert\NotNull(),
                  new Assert\NotBlank(),
                  new Assert\Length(['min' => 2]),
                ],
            ])
            ->add('body', PurifiedTextareaType::class, [
                'constraints' => [
                  new Assert\NotNull(),
                  new Assert\NotBlank(),
                  new Assert\Length(['min' => 2]),
                ],
            ])
            ->add('comment', PurifiedTextareaType::class, [
                'constraints' => [
                  new Assert\NotNull(),
                  new Assert\NotBlank(),
                  new Assert\Length(['min' => 2]),
                ],
            ])
        ;
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
