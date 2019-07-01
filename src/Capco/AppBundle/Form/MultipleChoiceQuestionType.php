<?php

namespace Capco\AppBundle\Form;

use Capco\AdminBundle\Form\QuestionValidationRuleType;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class MultipleChoiceQuestionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id');
        $builder->add('temporaryId', TextType::class);
        $builder->add('title', PurifiedTextType::class, [
            'strip_tags' => true,
            'purify_html' => true,
            'purify_html_profile' => 'default',
        ]);
        $builder->add('helpText', PurifiedTextType::class, [
            'strip_tags' => true,
            'purify_html' => true,
            'purify_html_profile' => 'default',
        ]);
        $builder->add('description', TextType::class, [
            'purify_html' => true,
            'purify_html_profile' => 'default',
        ]);
        $builder->add('private', CheckboxType::class);
        $builder->add('required', CheckboxType::class);
        $builder->add('type', IntegerType::class);
        $builder->add('choices', CollectionType::class, [
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'entry_type' => QuestionChoiceType::class,
            'delete_empty' => function (QuestionChoice $questionChoice = null) {
                return null === $questionChoice || empty($questionChoice->getTitle());
            },
        ]);
        $builder->add('alwaysJumpDestinationQuestion', RelayNodeType::class, ['required' => false, 'class' => AbstractQuestion::class]);
        $builder->add('jumps', CollectionType::class, [
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'entry_type' => LogicJumpType::class,
        ]);
        $builder->add('randomQuestionChoices', CheckboxType::class);
        $builder->add('otherAllowed', CheckboxType::class);
        $builder->add('validationRule', QuestionValidationRuleType::class);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => MultipleChoiceQuestion::class,
        ]);
    }
}
