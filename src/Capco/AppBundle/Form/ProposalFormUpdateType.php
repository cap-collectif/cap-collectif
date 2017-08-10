<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalFormUpdateType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class)
            ->add('description', PurifiedTextType::class)
            ->add('titleHelpText', TextType::class)

            ->add('usingThemes', CheckboxType::class)
            ->add('themeMandatory', CheckboxType::class)
            ->add('themeHelpText', TextType::class)

            ->add('usingCategories', CheckboxType::class)
            ->add('categoryMandatory', CheckboxType::class)
            ->add('categories', CollectionType::class, [
                'entry_type' => ProposalCategoryType::class,
            ])

            ->add('usingAddress', CheckboxType::class)
            ->add('addressHelpText', TextType::class)
            ->add('latMap', NumberType::class)
            ->add('lngMap', NumberType::class)
            ->add('zoomMap', IntegerType::class)

            ->add('descriptionHelpText', TextType::class)

            ->add('illustrationHelpText', TextType::class)

            ->add('')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ProposalForm::class,
        ]);
    }
}
