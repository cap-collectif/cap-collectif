<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\IsTrue;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormEvent;
use Capco\AppBundle\Form\DataTransformer\EntityToIdTransformer;

class OpinionType extends AbstractType
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
        if ($options['action'] === 'edit') {
            $builder
                ->add('confirm', 'checkbox', [
                    'mapped' => false,
                    'label' => 'opinion.form.confirm',
                    'required' => true,
                    'constraints' => [new IsTrue(['message' => 'opinion.votes_not_confirmed'])],
                ])
            ;
        }

        $builder
            ->add('title', 'text', [
                'label' => 'opinion.form.title',
                'required' => true,
            ])
            ->add('body', 'ckeditor', [
                'label' => 'opinion.form.body',
                'required' => true,
                'config_name' => 'user_editor',
            ])
            ->add('OpinionType', null, [
                'required' => true,
                'attr' => [
                    'class' => 'hidden',
                ],
                'label_attr' => [
                    'class' => 'hidden',
                ],
            ])
            ->add('link', 'hidden', [
                'required' => false,
                'mapped' => false,
            ])
            ->add('appendices', 'collection', [
                'type' => new AppendixType(),
                'label' => false,
                'required' => false,
                'allow_add' => true,
                'by_reference' => false,
            ])
            ->addEventListener(
                FormEvents::POST_SUBMIT,
                function (FormEvent $event) {
                    $entity = $event->getForm()->getData();
                    $entity->addParentConnection(
                        $event->getForm()->get('link')->getData()
                    );
                }
            )
        ;

        $this->transformer->setEntityClass('Capco\AppBundle\Entity\Opinion');
        $this->transformer->setEntityRepository('CapcoAppBundle:Opinion');

        $builder
            ->get('link')
            ->addModelTransformer($this->transformer)
        ;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Opinion',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
            'action' => 'create',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'opinion';
    }
}
