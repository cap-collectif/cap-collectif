<?php

namespace Capco\AdminBundle\Admin;

use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Show\ShowMapper;

use FOS\UserBundle\Model\UserManagerInterface;

class UserAdmin extends BaseAdmin
{

    protected $translationDomain = 'SonataAdminBundle';
    /**
     * {@inheritdoc}
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('username')
            ->add('email')
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
                    'edit' => array(),
                    'show' => array(),
                    'delete' => array(),
                )
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
            ->add('username')
            ->add('email')
            ->add('enabled')
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
            ->end()
            ->with('Groups')
            ->add('groups')
            ->end()
            ->with('Profile')
            ->add('dateOfBirth')
            ->add('firstname')
            ->add('lastname')
            ->add('website')
            ->add('biography')
            ->add('gender')
            ->add('locale')
            ->add('timezone')
            ->add('phone')
            ->end()
            ->with('Social')
            ->add('facebookUid')
            ->add('facebookName')
            ->add('twitterUid')
            ->add('twitterName')
            ->add('gplusUid')
            ->add('gplusName')
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
        // define group zoning
        $formMapper
            ->tab('User')
            ->with('Profile', array('class' => 'col-md-6'))->end()
            ->with('General', array('class' => 'col-md-6'))->end()
            ->with('Social', array('class' => 'col-md-6'))->end()
            ->end()
            ->tab('Security')
            ->with('Status', array('class' => 'col-md-4'))->end()
            ->with('Keys', array('class' => 'col-md-4'))->end()
            ->with('Roles', array('class' => 'col-md-12'))->end()
            ->end()
        ;

        $now = new \DateTime();

        $formMapper
            ->tab('User')
            ->with('General')
            ->add('username')
            ->add('email')
            ->add('plainPassword', 'text', array(
                'required' => (!$this->getSubject() || is_null($this->getSubject()->getId()))
            ))
            ->end()
            ->with('Profile')
            ->add('dateOfBirth', 'sonata_type_date_picker', array(
                'years' => range(1900, $now->format('Y')),
                'dp_min_date' => '1-1-1900',
                'dp_max_date' => $now->format('c'),
                'required' => false
            ))
            ->add('firstname', null, array('required' => false))
            ->add('lastname', null, array('required' => false))
            ->add('website', 'url', array('required' => false))
            ->add('biography', 'text', array('required' => false))
            ->add('gender', 'sonata_user_gender', array(
                'required' => true,
                'translation_domain' => $this->getTranslationDomain()
            ))
            ->add('locale', 'locale', array('required' => false))
            ->add('timezone', 'timezone', array('required' => false))
            ->add('phone', null, array('required' => false))
            ->end()
            ->with('Social')
            ->add('facebook_id', null, array(
                'required' => false,
                'label' => 'Facebook Id',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('facebook_access_token', null, array(
                'required' => false,
                'label' => 'Facebook access token',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('google_id', null, array(
                'required' => false,
                'label' => 'Google Id',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->add('google_access_token', null, array(
                'required' => false,
                'label' => 'Google access token',
                'translation_domain' => 'SonataAdminBundle',
            ))
            ->end()
            ->end()
        ;

        if ($this->getSubject() && !$this->getSubject()->hasRole('ROLE_SUPER_ADMIN')) {
            $formMapper
                ->tab('Security')
                ->with('Status')
                ->add('locked', null, array(
                    'required' => false,
                    'label' => 'Verrouillé',
                    'translation_domain' => 'SonataAdminBundle',
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
                ->with('Roles')
                ->add('realRoles', 'sonata_security_roles', array(
                    'label'    => 'form.label_roles',
                    'expanded' => true,
                    'multiple' => true,
                    'required' => false,
                ))
                ->end()
                ->end()
            ;
        }

        $formMapper
            ->tab('Security')
            ->with('Keys')
            ->add('token', null, array('required' => false))
            ->add('twoStepVerificationCode', null, array('required' => false))
            ->end()
            ->end()
        ;
    }

}
