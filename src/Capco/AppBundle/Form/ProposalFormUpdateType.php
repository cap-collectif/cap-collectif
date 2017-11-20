<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalFormUpdateType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class)
            ->add('commentable', CheckboxType::class)

            ->add('titleHelpText', PurifiedTextType::class)

            ->add('description', PurifiedTextType::class)
            ->add('descriptionHelpText', PurifiedTextType::class)

            ->add('summaryHelpText', PurifiedTextType::class)
            ->add('illustrationHelpText', PurifiedTextType::class)

            ->add('proposalInAZoneRequired', CheckboxType::class)

            ->add('usingThemes', CheckboxType::class)
            ->add('themeMandatory', CheckboxType::class)
            ->add('themeHelpText', PurifiedTextType::class)

            ->add('usingDistrict', CheckboxType::class)
            ->add('districtMandatory', CheckboxType::class)
            ->add('districtHelpText', PurifiedTextType::class)

            ->add('usingCategories', CheckboxType::class)
            ->add('categoryMandatory', CheckboxType::class)
            ->add('categoryHelpText', PurifiedTextType::class)

            ->add('usingAddress', CheckboxType::class)
            ->add('addressHelpText', PurifiedTextType::class)

            ->add('latMap', NumberType::class)
            ->add('lngMap', NumberType::class)
            ->add('zoomMap', IntegerType::class)

            ->add('commentable', CheckboxType::class)

            ->add('categories', CollectionType::class, [
                'entry_type' => ProposalCategoryType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ])

            ->add('districts', CollectionType::class, [
                'entry_type' => ProposalDistrictType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ])

            ->add('questions', CollectionType::class, [
                'allow_add' => true,
                'allow_delete' => true,
                'entry_type' => QuestionnaireAbstractQuestionType::class,
                'by_reference' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ProposalForm::class,
            'cascade_validation' => true,
        ]);
    }
}
