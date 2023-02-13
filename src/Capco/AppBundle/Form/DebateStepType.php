<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Form\Type\OrderedCollectionType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

class DebateStepType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class)
            ->add('label', TextType::class)
            ->add('startAt', DateType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
            ->add('endAt', DateType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
            ->add('body', TextType::class)
            ->add('metaDescription', TextType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('customCode', TextType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('isEnabled', CheckboxType::class)
            ->add('timeless', CheckboxType::class)
            ->add('debateType', TextType::class)
            ->add('debateContent', TextType::class)
            ->add('isAnonymousParticipationAllowed', CheckboxType::class)
            ->add('articles', OrderedCollectionType::class, [
                'entry_type' => DebateArticleType::class,
                'on_update' => static function (
                    DebateArticle $itemFromDb,
                    DebateArticle $itemFromUser
                ) {
                    $itemFromDb->setUrl($itemFromUser->getUrl());
                },
            ])
        ;

    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => DebateStep::class,
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
            'constraints' => new Valid(),
        ]);
    }
}
