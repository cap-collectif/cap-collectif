<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;

class SectionQuestionType extends AbstractType
{
    /**
     * @// TODO: delete `private` and `required` during the refacto.
     *
     * @see https://github.com/cap-collectif/platform/issues/6073 tech task.
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id', IntegerType::class);
        $builder->add('temporaryId', TextType::class);
        $builder->add('title', TextType::class, [
            'purify_html' => true,
            'purify_html_profile' => 'default',
        ]);
        $builder->add('description', TextType::class, [
            'purify_html' => true,
            'purify_html_profile' => 'default',
        ]);
        $builder->add('helpText', TextType::class, [
            'purify_html' => true,
            'purify_html_profile' => 'default',
        ]);
        $builder->add('type', IntegerType::class);
        $builder->add('private', CheckboxType::class);
        $builder->add('required', CheckboxType::class);
        $builder->add('jumps', CollectionType::class, [
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'entry_type' => LogicJumpType::class,
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => SectionQuestion::class,
        ]);
    }
}
