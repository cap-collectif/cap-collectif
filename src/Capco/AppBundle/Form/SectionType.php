<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Section;
use Capco\AppBundle\Enum\HomePageProjectsSectionConfigurationDisplayMode;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;

class SectionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('translations', TranslationCollectionType::class, [
                'fields' => ['title', 'teaser', 'locale'],
                'fields_options' => [
                    'title' => [
                        'required' => true,
                        'constraints' => [new NotBlank()],
                    ],
                ],
            ])
            ->add('title', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('teaser', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('position', NumberType::class)
            ->add('nbObjects', NumberType::class)
            ->add('enabled', CheckboxType::class, [
                'required' => true,
                'value' => true,
            ])
            ->add('displayMode', ChoiceType::class, [
                'choices' => [
                    HomePageProjectsSectionConfigurationDisplayMode::MOST_RECENT =>
                        HomePageProjectsSectionConfigurationDisplayMode::MOST_RECENT,
                    HomePageProjectsSectionConfigurationDisplayMode::CUSTOM =>
                        HomePageProjectsSectionConfigurationDisplayMode::CUSTOM,
                ],
            ])
            ->add('sectionProjects', CollectionType::class, [
                'entry_type' => SectionProjectType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ])
            ->add('centerLatitude', NumberType::class)
            ->add('centerLongitude', NumberType::class)
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Section::class,
            'csrf_protection' => false,
        ]);
    }
}
