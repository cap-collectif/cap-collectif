<?php

namespace Capco\AppBundle\Form\Type;

use Capco\AppBundle\Form\StripTagsTransformer;
use Exercise\HTMLPurifierBundle\Form\HTMLPurifierTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PurifiedTextType extends AbstractType
{
    private $purifier;
    private $stripTagsTransformer;

    public function __construct(
        HTMLPurifierTransformer $purifier,
        StripTagsTransformer $stripTagsTransformer
    ) {
        $this->purifier = $purifier;
        $this->stripTagsTransformer = $stripTagsTransformer;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $transformer =
            true === $options['strip_tags'] ? $this->stripTagsTransformer : $this->purifier;

        $builder->addViewTransformer($transformer);
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
