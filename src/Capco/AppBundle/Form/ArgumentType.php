<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Argument;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ArgumentType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('body', TextType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('type', IntegerType::class, [
                'required' => true,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Argument::class,
            'csrf_protection' => false,
        ]);
    }
}
