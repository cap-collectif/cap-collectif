<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Validator\Constraints\CheckExternalLink;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;

class AlphaProjectFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class, [
                'required' => true,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'default'
            ])
            ->add('opinionTerm', NumberType::class, [
                'required' => true
            ])
            ->add('projectType')
            ->add('Cover')
            ->add('video')
            ->add('themes', EntityType::class, [
                'class' => Theme::class,
                'multiple' => true,
                'choice_label' => 'id'
            ])
            ->add('metaDescription')
            ->add('isExternal')
            ->add('publishedAt', DateTimeType::class, [
                'required' => true,
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss'
            ])
            ->add('visibility')
            ->add('opinionCanBeFollowed');

        $builder->addEventListener(FormEvents::PRE_SUBMIT, function (FormEvent $event) {
            $form = $event->getForm();
            $project = $event->getData();
            if ($project && $project['isExternal']) {
                $form
                    ->add('externalLink', UrlType::class, [
                        'required' => true,
                        'constraints' => [new CheckExternalLink(), new NotBlank()]
                    ])
                    ->add('externalParticipantsCount')
                    ->add('externalContributionsCount')
                    ->add('externalVotesCount');
            } else {
                $form->add('externalLink', UrlType::class, [
                    'required' => false
                ]);
            }
        });
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver
            ->setDefaults([
                'data_class' => Project::class,
                'csrf_protection' => false
            ]);
    }
}
