<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\RegistrationForm;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;

class RegistrationFormQuestionsUpdateType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('questions', CollectionType::class, [
                'allow_add' => true,
                'allow_delete' => true,
                'entry_type' => QuestionnaireAbstractQuestionType::class,
                'by_reference' => false,
                'delete_empty' => function (
                    QuestionnaireAbstractQuestion $questionnaireAbstractQuestion = null
                ) {
                    return null === $questionnaireAbstractQuestion ||
                        empty($questionnaireAbstractQuestion->getQuestion()->getTitle());
                },
            ])
            ->add('domains')
            ->add('bottomTextDisplayed')
            ->add('topTextDisplayed')
            ->add('topText');
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => RegistrationForm::class,
            'constraints' => new Valid(),
        ]);
    }
}
