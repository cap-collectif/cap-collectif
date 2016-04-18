<?php

namespace Capco\AppBundle\Form;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

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
        $builder
            ->add('body', 'textarea', ['required' => true])
        ;

        if ($this->action === 'create') {
            $builder
                ->add('parent', null, ['required' => false])
            ;
        }

        if (!$this->user) {
            $builder
                ->add('authorName', null, ['required' => true])
                ->add('authorEmail', null, ['required' => true])
            ;
        }
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Comment',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return '';
    }
}
