<?php

namespace Capco\AppBundle\Form;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\Valid;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;

class DebateOpinionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('body', TextareaType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('author', RelayNodeType::class, [
                'class' => User::class,
            ])
            ->add('type', TextType::class, []);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => DebateOpinion::class,
            'csrf_protection' => false,
            'constraints' => new Valid(),
        ]);
    }
}
