<?php

namespace Capco\AdminBundle\Form;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestionValidationRule;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\DataMapperInterface;
use Symfony\Component\Form\Exception;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuestionValidationRuleType extends AbstractType implements DataMapperInterface
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->setDataMapper($this)
            ->add('type', 'choice', [
                'label' => 'admin.fields.validation_rule.type',
                'required' => false,
                'choices' => MultipleChoiceQuestionValidationRule::$typeLabels,
                'choice_translation_domain' => 'CapcoAppBundle',
            ])
            ->add('number', 'integer', [
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
        if ($forms['type']->getData() && $forms['number']->getData()) {
            $data = MultipleChoiceQuestionValidationRule::create(
                $forms['type']->getData(),
                $forms['number']->getData()
            );
        } else {
            $data = null;
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Questions\MultipleChoiceQuestionValidationRule',
            'empty_data' => null,
        ]);
    }


    public function getName()
    {
        return 'question_validation_rule';
    }


}
