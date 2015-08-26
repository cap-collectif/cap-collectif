<?php

namespace Capco\AppBundle\Form\Api;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class SynthesisElementType extends AbstractType
{
    protected $hasDivision = true;

    public function __construct($hasDivision = true)
    {
        $this->hasDivision = $hasDivision;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', null, ['required' => false])
            ->add('body', null, ['required' => false])
            ->add('published', null, ['required' => false])
            ->add('archived', null, ['required' => false])
            ->add('notation', null, ['required' => false])
            ->add('comment', null, ['required' => false])
            ->add('parent', 'entity', [
                'class' => 'Capco\AppBundle\Entity\Synthesis\SynthesisElement',
                'property' => 'id',
                'required' => false,
            ])
        ;

        if ($this->hasDivision) {
            $builder->add('division', new SynthesisDivisionType(), [
                'required' => false,
                'cascade_validation' => true,
            ]);
        }
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Synthesis\SynthesisElement',
            'csrf_protection' => false,
        ]);
    }

    public function getName()
    {
        return '';
    }
}
