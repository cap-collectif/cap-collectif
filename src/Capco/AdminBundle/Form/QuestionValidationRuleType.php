<?php

namespace Capco\AdminBundle\Form;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestionValidationRule;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\DataMapperInterface;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuestionValidationRuleType extends AbstractType implements DataMapperInterface
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->setDataMapper($this)
            ->add('type', ChoiceType::class, [
                'label' => 'admin.fields.validation_rule.type',
                'required' => false,
                'choices' => MultipleChoiceQuestionValidationRule::$typeLabels,
                'choice_translation_domain' => 'CapcoAppBundle',
            ])
            ->add('number', IntegerType::class, [
                'label' => 'admin.fields.validation_rule.number',
                'required' => false,
            ])
        ;
    }

    public function mapDataToForms($data, $forms)
    {
        $forms = iterator_to_array($forms);
        $forms['type']->setData($data ? $data->getType() : null);
        $forms['number']->setData($data ? $data->getNumber() : null);
    }

    public function mapFormsToData($forms, &$data)
    {
        $forms = iterator_to_array($forms);
        $data = null;
        if ($forms['type']->getData() && $forms['number']->getData()) {
            $data = MultipleChoiceQuestionValidationRule::create(
                $forms['type']->getData(),
                $forms['number']->getData()
            );
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => MultipleChoiceQuestionValidationRule::class,
            'empty_data' => null,
        ]);
    }
}
