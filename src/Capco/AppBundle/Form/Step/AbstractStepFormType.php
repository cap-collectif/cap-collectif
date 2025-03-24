<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Form\RequirementType;
use Capco\AppBundle\Form\Type\OrderedCollectionType;
use Capco\AppBundle\Validator\Constraints\CheckboxRequirementHasLabel;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

abstract class AbstractStepFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('type', null, [
                'mapped' => false,
            ])
            ->add('body')
            ->add('bodyUsingJoditWysiwyg')
            ->add('title', TextType::class, [
                'empty_data' => '',
            ])
            ->add('label')
            ->add('startAt', DateTimeType::class, [
                'widget' => 'single_text',
            ])
            ->add('endAt', DateTimeType::class, [
                'widget' => 'single_text',
            ])
            ->add('metaDescription')
            ->add('customCode')
            ->add('isEnabled')
            ->add('requirementsReason')
            ->add('requirements', OrderedCollectionType::class, [
                'entry_type' => RequirementType::class,
                'on_update' => static function (
                    Requirement $itemFromDb,
                    Requirement $itemFromUser
                ) {
                    $itemFromDb
                        ->setLabel($itemFromUser->getLabel())
                        ->setType($itemFromUser->getType())
                    ;
                },
                'constraints' => [new CheckboxRequirementHasLabel()],
            ])
        ;
        if ($builder->getData() instanceof ParticipativeStepInterface || $builder->getData() instanceof OtherStep) {
            $builder->add('timeless');
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => AbstractStep::class,
        ]);
    }
}
