import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';

class ProtectedRoute extends Component {
    render() {
        const { component: Component, perfisPermitidos, ...rest } = this.props;
        const isAuthenticated = sessionStorage.getItem('token');

        if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
        }

        if (perfisPermitidos && perfisPermitidos.length > 0) {
            let perfis = [];

            try {
                const armazenados = JSON.parse(
                    sessionStorage.getItem('perfis') || '[]'
                );

                perfis = Array.isArray(armazenados) ? armazenados : [];
            } catch (error) {
                perfis = [];
            }

            const autorizado = perfisPermitidos.some(
                perfil => perfis.includes(perfil)
            );

            if (!autorizado) {
                return <Navigate to="/home" replace />;
            }
        }

        return <Component {...rest} />;
    }
}

export default ProtectedRoute;