<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class MediaQuestionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('title', PurifiedTextType::class);
        $builder->add('helpText', PurifiedTextType::class);
        $builder->add('private', CheckboxType::class);
        $builder->add('required', CheckboxType::class);
        $builder->add('type', PurifiedTextType::class);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => MediaQuestion::class,
            'csrf_protection' => false,
        ]);
    }
}
