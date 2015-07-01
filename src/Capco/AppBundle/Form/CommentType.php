<?php

namespace Capco\AppBundle\Form;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class CommentType extends AbstractType
{
    private $user;

    public function __construct(User $user = null)
    {
        $this->user = $user;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('body', 'textarea', array(
                'required' => true,
                'label' => 'comment.form.body',
                'translation_domain' => 'CapcoAppBundle',
            ))
        ;

        if (null == $this->user) {
            $builder
                ->add('authorName', null, array(
                    'required' => true,
                    'translation_domain' => 'CapcoAppBundle',
                ))
                ->add('authorEmail', 'email', array(
                    'required' => true,
                    'translation_domain' => 'CapcoAppBundle',
                ))
            ;
        } else {
            $builder
                ->add('parent', null, [
                    'required' => false
                ])
            ;
        }
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Capco\AppBundle\Entity\AbstractComment',
            'csrf_protection' => false,
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return '';
    }
}
