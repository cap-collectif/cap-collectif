<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Form\DataTransformer\EntityToIdTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ResponseType extends AbstractType
{
    protected $transformer;

    public function __construct(EntityToIdTransformer $transformer)
    {
        $this->transformer = $transformer;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $this->transformer->setEntityClass(AbstractQuestion::class);
        $this->transformer->setEntityRepository('CapcoAppBundle:Questions\AbstractQuestion');
        $builder
            ->add('value', null)
            ->add('question', 'hidden')
        ;
        $builder
            ->get('question')
            ->addModelTransformer($this->transformer)
        ;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Response',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
            'cascade_validation' => true,
        ]);
    }

    public function getName()
    {
        return 'response';
    }
}
