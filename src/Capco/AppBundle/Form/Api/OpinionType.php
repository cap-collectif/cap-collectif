<?php

namespace Capco\AppBundle\Form\Api;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Capco\AppBundle\Form\AppendixType;
use Capco\AppBundle\Form\DataTransformer\EntityToIdTransformer;
use Doctrine\ORM\EntityManager;

class OpinionType extends AbstractType
{
    protected $em;

    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', 'text', ['required' => true])
            ->add('body', 'textarea', ['required' => true])
            ->add('OpinionType', null, ['required' => true])
            ->add('link', null, [
                'required' => false,
                'mapped' => false,
            ])
            ->add('appendices', 'collection', ['type' => new AppendixType()])
            ->addEventListener(
                FormEvents::POST_SUBMIT,
                function(FormEvent $event) {
                    $linkId =
                    $entity = $event->getForm()->getData();
                    $entity->addParentConnection(
                        $event->getForm()->get('link')->getData()
                    );
                }
            )
        ;

        $transformer = new EntityToIdTransformer($this->em);
        $transformer->setEntityClass('Capco\AppBundle\Entity\Opinion');
        $transformer->setEntityRepository('CapcoAppBundle:Opinion');

        $builder
            ->get('link')
            ->addModelTransformer($transformer)
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class'      => 'Capco\AppBundle\Entity\Opinion',
            'csrf_protection' => false,
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'api_opinion';
    }
}
