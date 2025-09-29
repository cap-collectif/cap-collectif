<?php

namespace Capco\AppBundle\Form\Type;

use Capco\AppBundle\Form\StripTagsTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PurifiedTextType extends AbstractType
{
    public function __construct(
        private readonly StripTagsTransformer $stripTagsTransformer
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if (true === $options['strip_tags']) {
            $builder->addViewTransformer($this->stripTagsTransformer);
        }
    }

    public function getParent()
    {
        return TextType::class;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'compound' => false,
            'strip_tags' => false,
        ]);
    }
}
