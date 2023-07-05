<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Enum\ProjectHeaderType;
use Capco\AppBundle\Form\Persister\ProjectDistrictsPersister;
use Capco\AppBundle\Form\Subscriber\ProjectDistrictsFieldSubscriber;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;

class AlphaProjectFormType extends AbstractType
{
    private ProjectDistrictsPersister $persister;

    public function __construct(ProjectDistrictsPersister $persister)
    {
        $this->persister = $persister;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class, [
                'required' => true,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('restrictedViewerGroups', EntityType::class, [
                'class' => Group::class,
                'multiple' => true,
            ])
            ->add('projectType')
            ->add('cover')
            ->add('video')
            ->add('headerType', ChoiceType::class, [
                'choices' => ProjectHeaderType::getAvailableTypes(),
                'preferred_choices' => ProjectHeaderType::FULL_WIDTH,
                'empty_data' => ProjectHeaderType::FULL_WIDTH,
                'required' => false,
            ])
            ->add('coverFilterOpacityPercent', NumberType::class, [
                'required' => false,
                'empty_data' => (string) Project::DEFAULT_COVER_FILTER_OPACITY,
                'attr' => [
                    'min' => 0,
                    'max' => 100,
                ],
            ])
            ->add('districts', EntityType::class, [
                'class' => ProjectDistrict::class,
                'multiple' => true,
                'required' => true,
                'mapped' => false,
            ])
            ->add('themes', EntityType::class, [
                'class' => Theme::class,
                'multiple' => true,
                'choice_label' => 'id',
            ])
            ->add('locale', EntityType::class, [
                'required' => false,
                'class' => Locale::class,
            ])
            ->add('metaDescription')
            ->add('isExternal')
            ->add('publishedAt', DateTimeType::class, [
                'required' => true,
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
            ->add('visibility')
            ->add('opinionCanBeFollowed')
            ->add('archived', CheckboxType::class)
            ->add('address', TextType::class)
        ;

        $builder->addEventSubscriber(new ProjectDistrictsFieldSubscriber($this->persister));

        $builder->addEventListener(FormEvents::PRE_SUBMIT, function (FormEvent $event) {
            $form = $event->getForm();
            $project = $event->getData();
            if ($project && $project['isExternal']) {
                $form
                    ->add('externalLink', UrlType::class, [
                        'required' => true,
                        'constraints' => [new NotBlank()],
                    ])
                    ->add('externalParticipantsCount')
                    ->add('externalContributionsCount')
                    ->add('externalVotesCount')
                ;
            } else {
                $form->add('externalLink', UrlType::class, [
                    'required' => false,
                ]);
            }
        });
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Project::class,
            'csrf_protection' => false,
        ]);
    }
}
