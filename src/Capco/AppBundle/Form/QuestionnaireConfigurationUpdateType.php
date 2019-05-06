<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

class QuestionnaireConfigurationUpdateType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class, [
                'strip_tags' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('description', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('questions', CollectionType::class, [
                'allow_add' => true,
                'allow_delete' => true,
                'entry_type' => QuestionnaireAbstractQuestionType::class,
                'by_reference' => false,
                'delete_empty' => function (
                    QuestionnaireAbstractQuestion $questionnaireAbstractQuestion = null
                ) {
                    return null === $questionnaireAbstractQuestion ||
                        null === $questionnaireAbstractQuestion->getQuestion() ||
                        empty($questionnaireAbstractQuestion->getQuestion()->getTitle());
                },
            ])
            ->add('notifyResponseCreate')
            ->add('notifyResponseUpdate')
            ->add('notifyResponseDelete');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => Questionnaire::class,
            'constraints' => new Valid(),
        ]);
    }
}
