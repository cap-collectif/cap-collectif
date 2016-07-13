<?php

namespace Capco\AppBundle\Form;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Validator\Constraints\IsTrue;

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
        if ($options['actionType'] === 'edit') {
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
            ->add('body', 'purified_textarea', ['required' => true])
        ;

        if ($options['actionType'] === 'create') {
            $builder
                ->add('parent', null, ['required' => false])
            ;
        }

        if (!$this->user) {
            $builder
                ->add('authorName', 'purified_text', ['required' => true])
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
            'actionType' => 'create',
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
