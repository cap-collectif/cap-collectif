<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Project;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

class ProjectType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('Author', null, ['required' => true]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Project::class,
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
            'constraints' => new Valid(),
        ]);
    }
}
