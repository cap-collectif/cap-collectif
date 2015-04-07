<?php

namespace Capco\AdminBundle\Admin;

use Capco\UserBundle\Entity\User;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class UserAdmin extends BaseAdmin
{
    private $rolesLabels = [
        'ROLE_USER' => 'admin.fields.user.roles.user',
        'ROLE_ADMIN' => 'admin.fields.user.roles.admin',
        'ROLE_SUPER_ADMIN' => 'admin.fields.user.roles.super_admin',
    ];

    private $rolesLabelsNoSuper = [
        'ROLE_USER' => 'admin.fields.user.roles.user',
        'ROLE_ADMIN' => 'admin.fields.user.roles.admin',
    ];

    protected $translationDomain = 'SonataAdminBundle';

    public function getFormBuilder()
    {
        $this->formOptions['data_class'] = $this->getClass();

        $options = $this->formOptions;
        $options['validation_groups'] = 'Default';

        $formBuilder = $this->getFormContractor()->getFormBuilder($this->getUniqid(), $options);

        $this->defineFormBuilder($formBuilder);

        return $formBuilder;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('email')
            ->add('username', null, array(
                'label' => 'admin.fields.user.username',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('slug', null, array(
                'label' => 'admin.fields.user.slug',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('enabled', null, array(
                'editable' => true,
            ))
            ->add('locked', null, array(
                'editable' => true,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.user.updated_at',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('_action', 'actions', array(
                'label' => 'admin.fields.user.action',
                'translation_domain' => 'SonataAdminBundle',
                'actions' => array(
                    'edit' => array(
                        'template' => 'CapcoAdminBundle:User:list__action_edit.html.twig',
                    ),
                    'show' => array(),
                    'delete' => array(
                        'template' => 'CapcoAdminBundle:User:list__action_delete.html.twig',
                    ),
                ),
            ))
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureDatagridFilters(DatagridMapper $filterMapper)
    {
        $filterMapper
            ->add('id')
            ->add('username', null, array(
                'label' => 'admin.fields.user.username',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('email')
            ->add('enabled', null, array(
                'label' => 'admin.fields.user.enabled',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('locked')
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->with('General')
            ->add('username')
            ->add('email')
            ->add('slug', null, array(
                'label' => 'Slug',
            ))
            ->end()
            ->with('Profile')
            ->add('Media', 'sonata_media_type', array(
                'template' => 'CapcoAdminBundle:User:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'Avatar',
            ))
            ->add('dateOfBirth')
            ->add('firstname')
            ->add('lastname')
            ->add('website')
            ->add('biography')
            ->add('city', null, array(
                'label' => 'Ville',
            ))
            ->add('gender')
            ->add('locale')
            ->add('timezone')
            ->add('phone')
            ->end()
            ->with('Social')
            ->add('facebook_id', null, array(
                'required' => false,
                'label' => 'form.label_facebook_name',
//                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('facebook_access_token', null, array(
                'label' => 'admin.fields.user.facebook_access_token',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('google_id', null, array(
                'required' => false,
                'label' => 'admin.fields.user.google_id',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('google_access_token', null, array(
                'required' => false,
                'label' => 'admin.fields.user.google_access_token',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->end()
            ->with('Security')
            ->add('token')
            ->add('twoStepVerificationCode')
            ->end()
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $currentUser = $user = $this->getConfigurationPool()->getContainer()->get('security.context')->getToken()->getUser();
        $subject = $this->getSubject();

        // define group zoning
        $formMapper
            ->tab('User')
            ->with('Profile', array('class' => 'col-md-6'))->end()
            ->with('General', array('class' => 'col-md-6'))->end()
            ->with('Social', array('class' => 'col-md-6'))->end()
            ->end()
        ;
        if (($subject && !$subject->hasRole('ROLE_SUPER_ADMIN')) || $currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $formMapper
                ->tab('Security')
                ->with('Status', array('class' => 'col-md-4'))->end()
                ->with('Keys', array('class' => 'col-md-4'))->end()
                ->with('Roles', array('class' => 'col-md-12'))->end()
                ->end()
            ;
        }

        $now = new \DateTime();

        $formMapper
            ->tab('User')
            ->with('General')
            ->add('username')
            ->add('email')
            ->add('plainPassword', 'text', array(
                'required' => (!$this->getSubject() || is_null($this->getSubject()->getId())),
            ))
            ->end()
            ->with('Profile')
            ->add('Media', 'sonata_type_model_list', array(
                'required' => false,
                'label' => 'Avatar',
            ), array(
                'link_parameters' => array(
                'context' => 'default',
                'hide_context' => true,
            ), ))
            ->add('dateOfBirth', 'sonata_type_date_picker', array(
                'years' => range(1900, $now->format('Y')),
                'dp_min_date' => '1-1-1900',
                'dp_max_date' => $now->format('c'),
                'required' => false,
            ))
            ->add('firstname', null, array('required' => false))
            ->add('lastname', null, array('required' => false))
            ->add('website', 'url', array('required' => false))
            ->add('biography', 'text', array('required' => false))
            ->add('city', null, array(
                'required' => false,
                'label' => 'Ville',
            ))
            ->add('gender', 'sonata_user_gender', array(
                'required' => true,
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('locale', 'locale', array('required' => false))
            ->add('timezone', 'timezone', array('required' => false))
            ->add('phone', null, array('required' => false))
            ->end()
            ->with('Social')
            ->add('facebook_id', null, array(
                'required' => false,
                'label' => 'form.label_facebook_uid',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('google_id', null, array(
                'required' => false,
                'label' => 'show.label_gplus_uid',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->end()
            ->end()
        ;

        if (($subject && !$subject->hasRole('ROLE_SUPER_ADMIN')) || $currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $formMapper
                ->tab('Security')
                ->with('Status')
                ->add('locked', null, array(
                    'required' => false,
                    'label' => 'Verrouillé',
                    'translation_domain' => 'SonataAdminBundle',
                ))
                ->add('isTermsAccepted', null, array(
                    'required' => false,
                    'label' => 'Termes acceptés',
                    'translation_domain' => 'SonataAdminBundle',
                    'data' => true,
                ))
                ->add('expired', null, array(
                    'required' => false,
                    'label' => 'Expiré',
                    'translation_domain' => 'SonataAdminBundle',
                ))
                ->add('enabled', null, array(
                    'required' => false,
                    'label' => 'Activé',
                    'translation_domain' => 'SonataAdminBundle',
                ))
                ->add('credentialsExpired', null, array(
                    'required' => false,
                    'label' => 'Identifiants de connexion expirés',
                    'translation_domain' => 'SonataAdminBundle',
                ))
                ->end()
            ;
            if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
                $formMapper
                    ->with('Roles')
                    ->add(
                        'realRoles',
                        'sonata_security_roles',
                        array(
                            'label' => 'form.label_roles',
                            'expanded' => true,
                            'multiple' => true,
                            'required' => false,
                            'translation_domain' => 'SonataAdminBundle',
                            'choices' => $this->rolesLabels,
                        )
                    )
                    ->end()
                ;
            } else {
                $formMapper
                    ->with('Roles')
                    ->add(
                        'realRoles',
                        'sonata_security_roles',
                        array(
                            'label' => 'form.label_roles',
                            'expanded' => true,
                            'multiple' => true,
                            'required' => false,
                            'translation_domain' => 'SonataAdminBundle',
                            'choices' => $this->rolesLabelsNoSuper,
                        )
                    )
                    ->end()
                ;
            }
            $formMapper
                ->with('Keys')
                ->add('token', null, array('required' => false))
                ->add('twoStepVerificationCode', null, array('required' => false))
                ->end()
                ->end()
            ;
        }
    }

    public function prePersist($user)
    {
        $user->setIsTermsAccepted(true);
    }

    public function getTemplate($name)
    {
        if ($name == 'delete') {
            return 'CapcoAdminBundle:User:delete.html.twig';
        }

        return parent::getTemplate($name);
    }
}
