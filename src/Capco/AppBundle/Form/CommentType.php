<?php

namespace Capco\AppBundle\Form;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Validator\Constraints\True;

class CommentType extends AbstractType
{
    private $user;
    private $action;

    public function __construct(User $user = null, $action = 'create')
    {
        $this->user = $user;
        $this->action = $action;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->action === 'edit') {
            $builder
                ->add('confirm', 'checkbox', array(
                    'mapped' => false,
                    'label' => 'comment.form.confirm',
                    'required' => true,
                    'constraints' => [new True(['message' => 'comment.votes_not_confirmed'])],
                ))
            ;
        }

        $builder
            ->add('body', 'textarea', array(
                'required' => true,
                'label' => 'comment.form.body',
                'translation_domain' => 'CapcoAppBundle',
            ))
        ;

        if ($this->action === 'create') {
            $builder
                ->add('parent', null, [
                    'required' => false,
                ])
            ;
        }

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
        }
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Capco\AppBundle\Entity\Comment',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
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
